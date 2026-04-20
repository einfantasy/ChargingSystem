using System.Security.Cryptography;
using System.Text;

namespace ChargingSystem.Server;

public class PasswordService
{
    private const int SaltSize = 16;
    private const int KeySize = 32;
    private const int Iterations = 10000;
    private const char HashDelimiter = ':';

    public string HashPassword(string password)
    {
        byte[] salt = new byte[SaltSize];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(salt);
        }

        byte[] hash = Pbkdf2(password, salt, Iterations, KeySize, HashAlgorithmName.SHA256);

        return string.Join(HashDelimiter, Convert.ToBase64String(salt), Convert.ToBase64String(hash));
    }

    public bool VerifyPassword(string password, string hashedPassword)
    {
        var parts = hashedPassword.Split(HashDelimiter);
        if (parts.Length != 2)
            return false;

        byte[] salt = Convert.FromBase64String(parts[0]);
        byte[] hash = Convert.FromBase64String(parts[1]);

        byte[] testHash = Pbkdf2(password, salt, Iterations, KeySize, HashAlgorithmName.SHA256);
        return CryptographicOperations.FixedTimeEquals(hash, testHash);
    }

    private static byte[] Pbkdf2(string password, byte[] salt, int iterations, int keyLength, HashAlgorithmName hashAlgorithm)
    {
        return Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, hashAlgorithm, keyLength);
    }
}
