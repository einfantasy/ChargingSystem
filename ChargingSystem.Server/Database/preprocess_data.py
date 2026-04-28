import os
import re
import io
import msoffcrypto
import openpyxl
from openpyxl.styles import Alignment
from openpyxl.utils import get_column_letter
from openpyxl.utils.cell import coordinate_from_string
from openpyxl.utils import column_index_from_string
from datetime import datetime, timedelta
from tqdm import tqdm  # 引入 tqdm 进度条库
from copy import deepcopy

# 文件路径与密码配置
INPUT_PATH = r"C:\Users\einfa\source\repos\ChargingSystem\ChargingSystem.Server\Database\data.xlsx"
OUTPUT_PATH = r"C:\Users\einfa\source\repos\ChargingSystem\ChargingSystem.Server\Database\data_processed.xlsx"
PASSWORD = "314159"
MAX_ROW = 58
START_COL = 12  # L = 12

# 匹配 "2023年1月" 或 "2023年12月" 这样的格式
DATE_PATTERN = re.compile(r"^\d{4}年\d{1,2}月$")


def decrypt_and_load(path, pwd):
    """解密文件并加载为 openpyxl 工作簿"""
    with open(path, "rb") as fsrc:
        dec = io.BytesIO()
        crypto = msoffcrypto.OfficeFile(fsrc)
        crypto.load_key(password=pwd)
        crypto.decrypt(dec)
    dec.seek(0)
    return openpyxl.load_workbook(dec)


def save(wb, path):
    """保存工作簿并加密输出"""
    wb.save(path)

def get_col_number_from_coordinate(coordinate):
    col_letter, _ = coordinate_from_string(coordinate)
    col_number = column_index_from_string(col_letter)
    return col_number

def merge_row_below(ws, coordinate):
    """
    将指定合并单元格下方的对应区域合并，并复制值
    :param ws: 工作表对象
    :param coordinate: 第一行合并单元格的坐标，如 "L1"
    """
    # 1. 查找该单元格所属的合并区域
    target_range = None
    for merged_range in ws.merged_cells.ranges:
        if coordinate in merged_range:
            target_range = merged_range
            break

    if not target_range:
        print(f"{coordinate} 不是合并单元格，操作取消。")
        return

    # 2. 获取合并区域的列范围 (L1:U1)
    min_col = target_range.min_col
    max_col = target_range.max_col
    if get_col_number_from_coordinate(coordinate) > min_col:
        return

    # 获取第一行的值 (合并单元格只有左上角有值)
    first_row_value = str(ws.cell(row=1, column=min_col).value or "")[:2]

    print(f"正在处理: {first_row_value}")
    for i in range(min_col, max_col + 1):
        # 3. 确定第二行的目标范围
        # 目标单元格是第二行的起始位置 (例如 L2)
        target_cell_row2 = ws.cell(row=2, column=i)
        # 复制值
        target_cell_row2.value = first_row_value
    
    # 4. 执行第二行的合并
    # 如果范围只有一列，不需要合并；如果是多列，则合并
    #if min_col < max_col:
    #    safe_merge_cells(ws, 2, min_col, 2, max_col)
    #    print(f"已合并 {get_column_letter(min_col)}2:{get_column_letter(max_col)}2 并复制值")
    #else:
    #    print(f"原单元格未跨列，仅复制值到 {get_column_letter(min_col)}2")

def excel_serial_to_ym(serial_number):
    """
    将 Excel 序列号转换为 'yyyy年m月' 格式
    """
    try:
        # 确保输入是数字（防止字符串导致计算错误）
        serial_number = float(serial_number)
        
        # Excel 的基准日期是 1899年12月30日
        # 例如：1899-12-31 对应 1
        base_date = datetime(1899, 12, 30)
        
        # 计算实际日期
        actual_date = base_date + timedelta(days=serial_number)
        
        # 格式化为 "2020年4月" 这种形式
        return f"{actual_date.year}年{actual_date.month}月"
        
    except Exception as e:
        print(f"日期转换错误: {e}")
        return None

def safe_merge_cells(ws, start_row, start_col, end_row, end_col):
    # 1. 遍历当前工作表中所有的合并区域
    # 注意：这里必须将 ws.merged_cells.ranges 转换成 list 再遍历
    # 否则在循环中取消合并会改变原集合的大小，导致报错
    for merged_range in list(ws.merged_cells.ranges):
        # 2. 判断原有的合并区域是否在我们即将合并的目标范围内
        # 只要原有的合并区域与我们要合并的区域有任何交集，就先把旧的取消掉
        if (start_row <= merged_range.max_row and end_row >= merged_range.min_row and
            start_col <= merged_range.max_col and end_col >= merged_range.min_col):
            ws.unmerge_cells(merged_range.coord)
    
    # 3. 清除完冲突的旧合并后，再安全地执行新的合并
    ws.merge_cells(start_row=start_row, start_column=start_col, end_row=end_row, end_column=end_col)

def main():
    print("正在解密并加载文件...")
    wb = decrypt_and_load(INPUT_PATH, PASSWORD)
    ws = wb.active

    # Step 1: 删除第 59 行之后的所有数据
    if ws.max_row > MAX_ROW:
        ws.delete_rows(MAX_ROW + 1, ws.max_row - MAX_ROW)
        print(f"已裁剪多余行，当前最大行号: {ws.max_row}")

    # Step 2 & 3: 从第 12 列（L列）开始处理表头逻辑
    col = START_COL
    region_start = None
    
    # 【新增】记录初始的最大列数，作为进度条的总长度
    initial_max_column = ws.max_column

    cols_to_delete = []
    # 注意：由于循环中会动态删除列，ws.max_column 会实时变化
    while col <= ws.max_column:
        cell_val = ws.cell(row=1, column=col).value
        if cell_val is None:
            col += 1
            continue

        cell_str = str(cell_val).strip()
        print(f"cell_val: {cell_str}")

        #if DATE_PATTERN.match(cell_str):
        if cell_str.isdigit() or (cell_str.replace('.', '').isdigit() and cell_str.count('.') < 2):
            saved_date = excel_serial_to_ym(cell_str)
            date_col = col

            # 确定该日期左侧连续非日期区域的起始位置
            if region_start is not None:
                start_col = region_start
            else:
                start_col = date_col
                c = date_col - 1
                while c >= START_COL:
                    cv = ws.cell(row=1, column=c).value
                    if cv is not None and str(cv).strip() and not DATE_PATTERN.match(str(cv).strip()):
                        start_col = c
                        c -= 1
                    else:
                        break

            # 动作A：将第一行非日期区域的值复制到第二行
            for r2_col in range(start_col, date_col):
                col_letter = get_column_letter(r2_col)
                coordinate_str = f"{col_letter}1"
                merge_row_below(ws, coordinate_str)

            # 动作B：删除原始的日期列
            #ws.delete_cols(date_col, 1)
            check_coord = f"{get_column_letter(date_col)}1"
            for merged_range in ws.merged_cells.ranges:
                if check_coord in merged_range:
                    target_range = merged_range
                    break

            if target_range:
                # --- 情况 A: 该列属于一个合并区域 ---
    
                # 获取合并区域的起始列和结束列
                start_del_col = target_range.min_col
                end_del_col = target_range.max_col
    
                # 计算需要删除的列数
                num_cols_to_delete = end_del_col - start_del_col + 1
    
                print(f"发现合并区域: {get_column_letter(start_del_col)}1:{get_column_letter(end_del_col)}1")
                cols_to_delete.append((start_del_col, num_cols_to_delete))
            else:
                # --- 情况 B: 该列是普通列（未合并） ---
                print(f"列 {get_column_letter(date_col)} 是普通列，正在删除...")
                ws.delete_cols(date_col, 1)

            # 动作C：合并第一行的单元格并填入日期
            merge_end = date_col - 1
            if start_col < merge_end:
                safe_merge_cells(ws, 1, start_col, 1, merge_end)
                print(f"正在合并 {start_col} 到 {merge_end}")
            
            target_cell = ws.cell(row=1, column=start_col)
            target_cell.value = saved_date
            print(f"正在处理 {saved_date}")

            region_start = None
            col = date_col + num_cols_to_delete
        else:
            if region_start is None:
                region_start = col
            col += 1

    if cols_to_delete:
        print("开始统一执行列删除操作...")

        # 1. 记录所有现有的合并单元格信息（使用 deepcopy 防止后续操作影响原始数据）
        # 注意：需要确保文件开头导入了 from copy import deepcopy
        merged_ranges = deepcopy(ws.merged_cells.ranges)

        # 2. 取消所有合并单元格（打散）
        for merged_range in merged_ranges:
            ws.unmerge_cells(merged_range.coord)

        # 按照起始列号倒序排序（避免删除前列影响后列的索引）
        cols_to_delete.sort(key=lambda x: x, reverse=True)
    
        # 3. 执行删除列操作
        for start_col_idx, amount in cols_to_delete:
            print(f"正在删除从第 {get_column_letter(start_col_idx)} 列开始的 {amount} 列...")
            ws.delete_cols(idx=start_col_idx, amount=amount)

        # 4. 重新执行合并
        for merged_range in merged_ranges:
            old_min_col = merged_range.min_col
            old_max_col = merged_range.max_col
            # 修复点1：保留原始的多行合并信息，不再假设只有一行
            min_r, max_r = merged_range.min_row, merged_range.max_row
    
            # 计算这个合并区域在经历多次删除后，最终应该向左平移多少列
            shift = 0
            should_skip = False
        
            for start_del, amount in cols_to_delete:
                end_del = start_del + amount - 1 # 计算删除的结束列
            
                # 情况A：删除区间与合并区域有重叠，该合并区域应被废弃
                # 判断重叠：删除的结束列 >= 合并起始 且 删除的起始列 <= 合并结束
                if end_del >= old_min_col and start_del <= old_max_col:
                    should_skip = True
                    break
                # 情况B：删除的列完全在合并区域的左侧，合并区域需要向左平移
                # 修复点2：这里包含等于的情况，因为删除起始列正好在合并列左侧或重合（重合已被情况A捕获）
                elif start_del < old_min_col:
                    shift += amount
    
            # 如果该区域没有被删除区间覆盖，则重新合并
            if not should_skip:
                new_min_col = old_min_col - shift
                new_max_col = old_max_col - shift
                # 确保列号合法（大于0）
                if new_min_col > 0 and new_max_col > 0:
                    ws.merge_cells(start_row=min_r, start_column=new_min_col, end_row=max_r, end_column=new_max_col)
        print("列删除操作全部完成。")

    # 更新日期
    # 【新增】初始化 tqdm 进度条，desc为描述信息，total为总进度数
    print("开始处理日期...")
    pbar = tqdm(total=initial_max_column - START_COL + 1, desc="处理列进度")
    col = START_COL
    while col <= ws.max_column:
        cell_val = ws.cell(row=3, column=col).value
        cell_str = str(cell_val).strip() if cell_val is not None else ""

        target_range = None
        for merged_range in ws.merged_cells.ranges:
            if merged_range.min_row <= 1 <= merged_range.max_row and merged_range.min_col <= col <= merged_range.max_col:
                target_range = merged_range
                break
        
        if target_range:
            first_row_value = ws.cell(row=target_range.min_row, column=target_range.min_col).value
            safe_first_value = str(first_row_value) if first_row_value is not None else ""
            target_cell = ws.cell(row=3, column=col)
            target_cell.value = safe_first_value + cell_str + "日"

        pbar.update(1)
        col += 1

    print(f"处理完成，保存至: {OUTPUT_PATH}")
    save(wb, OUTPUT_PATH)
    print("任务全部完成！")

if __name__ == "__main__":
    main()