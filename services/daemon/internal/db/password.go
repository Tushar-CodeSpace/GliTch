package db

import (
	"crypto/rand"
	"crypto/sha512"
	"crypto/subtle"
	"encoding/hex"
	"strings"

	"golang.org/x/crypto/pbkdf2"
)

const (
	pbkdf2Iterations = 10000
	pbkdf2KeyLen     = 64
)

// HashPassword hashes a password using PBKDF2 with SHA-512 and a random salt.
func HashPassword(password string, optionalSalt ...string) string {
	var salt string
	if len(optionalSalt) > 0 && optionalSalt[0] != "" {
		salt = optionalSalt[0]
	} else {
		buf := make([]byte, 16)
		if _, err := rand.Read(buf); err != nil {
			salt = "fallback_random_salt_1234567890"
		} else {
			salt = hex.EncodeToString(buf)
		}
	}

	dk := pbkdf2.Key([]byte(password), []byte(salt), pbkdf2Iterations, pbkdf2KeyLen, sha512.New)
	return salt + ":" + hex.EncodeToString(dk)
}

// VerifyPassword checks whether a plaintext password matches the stored salt:hash.
func VerifyPassword(password, stored string) bool {
	if stored == "" {
		return false
	}
	if !strings.Contains(stored, ":") {
		return subtle.ConstantTimeCompare([]byte(password), []byte(stored)) == 1
	}

	parts := strings.SplitN(stored, ":", 2)
	salt := parts[0]
	originalHashHex := parts[1]

	dk := pbkdf2.Key([]byte(password), []byte(salt), pbkdf2Iterations, pbkdf2KeyLen, sha512.New)
	testHashHex := hex.EncodeToString(dk)

	if len(originalHashHex) != len(testHashHex) {
		return false
	}

	return subtle.ConstantTimeCompare([]byte(originalHashHex), []byte(testHashHex)) == 1
}
