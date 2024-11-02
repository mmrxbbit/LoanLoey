package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	_ "github.com/go-sql-driver/mysql"
	"golang.org/x/crypto/bcrypt"
)

type Account struct {
    Username  string `json:"username"`
    Password  string `json:"password"`
    FirstName string `json:"first_name"`
    LastName  string `json:"last_name"`
    IDCard    string `json:"id_card"`
    DOB       string `json:"dob"`
    PhoneNo   string `json:"phone_no"`
    Address   string `json:"address"`
}

type Admin struct {
    Username  string `json:"username"`
    Password  string `json:"password"`
    FirstName string `json:"first_name"`
    LastName  string `json:"last_name"`
}

type UserInfo struct {
    FirstName  string `json:"first_name"`
    LastName   string `json:"last_name"`
    IDCard     string `json:"id_card"`
    DOB        string `json:"dob"`
    PhoneNo    string `json:"phone_no"`
    Address    string `json:"address"`
    CreditScore int    `json:"credit_score"`
}

type Database struct {
    *sql.DB
}

func (db *Database) Signup(account Account) error {
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(account.Password), bcrypt.DefaultCost)
    if err != nil {
        return fmt.Errorf("hashing password: %w", err)
    }

    query := `INSERT INTO account (Username, PasswordHash) VALUES (?, ?)`
    result, err := db.Exec(query, account.Username, hashedPassword)
    if err != nil {
        return fmt.Errorf("inserting account: %w", err)
    }

    accountID, err := result.LastInsertId()
    if err != nil {
        return fmt.Errorf("getting last insert ID: %w", err)
    }

    userQuery := `INSERT INTO user (AccountID, FirstName, LastName, IDCard, DOB, PhoneNo, Address, CreditScore) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, 0)`
    _, err = db.Exec(userQuery, accountID, account.FirstName, account.LastName, account.IDCard, account.DOB, account.PhoneNo, account.Address)
    if err != nil {
        return fmt.Errorf("inserting user: %w", err)
    }

    return nil
}

func (db *Database) GetUserInfoByID(userID int) (*UserInfo, error) {
    var userInfo UserInfo

    query := `SELECT u.FirstName, u.LastName, u.IDCard, u.DOB, u.PhoneNo, u.Address, u.CreditScore 
              FROM user u
              WHERE u.UserID = ?`
    err := db.QueryRow(query, userID).Scan(&userInfo.FirstName, &userInfo.LastName, &userInfo.IDCard, &userInfo.DOB, &userInfo.PhoneNo, &userInfo.Address, &userInfo.CreditScore)
    if err != nil {
        return nil, fmt.Errorf("querying user info: %w", err)
    }

    return &userInfo, nil
}



func (db *Database) CreateAdmin(admin Admin) error {
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(admin.Password), bcrypt.DefaultCost)
    if err != nil {
        return fmt.Errorf("hashing password: %w", err)
    }

    query := `INSERT INTO account (Username, PasswordHash) VALUES (?, ?)`
    result, err := db.Exec(query, admin.Username, hashedPassword)
    if err != nil {
        return fmt.Errorf("inserting account: %w", err)
    }

    accountID, err := result.LastInsertId()
    if err != nil {
        return fmt.Errorf("getting last insert ID: %w", err)
    }

    adminQuery := `INSERT INTO admin (AccountID, FirstName, LastName) VALUES (?, ?, ?)`
    _, err = db.Exec(adminQuery, accountID, admin.FirstName, admin.LastName)
    if err != nil {
        return fmt.Errorf("inserting admin: %w", err)
    }

    return nil
}



func (db *Database) Login(username, password string) (string, error) {
    var storedHash string
    var accountID int64
    var isAdmin bool

    query := `SELECT PasswordHash, AccountID FROM account WHERE Username = ?`
    err := db.QueryRow(query, username).Scan(&storedHash, &accountID)
    if err != nil {
        return "", fmt.Errorf("querying for username %s: %w", username, err)
    }

    if err := bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(password)); err != nil {
        return "", fmt.Errorf("invalid credentials: %w", err)
    }

    adminQuery := `SELECT COUNT(*) FROM admin WHERE AccountID = ?`
    err = db.QueryRow(adminQuery, accountID).Scan(&isAdmin)
    if err != nil {
        return "", fmt.Errorf("checking admin status: %w", err)
    }

    if isAdmin {
        return "admin", nil
    }
    return "user", nil
}


func main() {
    db, err := sql.Open("mysql", "root:root@tcp(localhost:8889)/loanloey")
    if err != nil {
        log.Fatalf("Failed to connect to database: %v", err)
    }
    defer db.Close()

    database := &Database{db}

    http.HandleFunc("/signup", func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
            http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
            return
        }

        var account Account
        if err := json.NewDecoder(r.Body).Decode(&account); err != nil {
            http.Error(w, "Invalid request body", http.StatusBadRequest)
            return
        }

        if err := database.Signup(account); err != nil {
            http.Error(w, fmt.Sprintf("Signup failed: %v", err), http.StatusInternalServerError)
            return
        }

        response := map[string]string{"message": "Account and User created successfully!"}
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(response)
    })

    http.HandleFunc("/createAdmin", func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
            http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
            return
        }

        var admin Admin
        if err := json.NewDecoder(r.Body).Decode(&admin); err != nil {
            http.Error(w, "Invalid request body", http.StatusBadRequest)
            return
        }

        if err := database.CreateAdmin(admin); err != nil {
            http.Error(w, fmt.Sprintf("CreateAdmin failed: %v", err), http.StatusInternalServerError)
            return
        }

        response := map[string]string{"message": "Admin created successfully!"}
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(response)
    })

    http.HandleFunc("/getUserInfo", func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodGet {
            http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
            return
        }
    
        userIDStr := r.URL.Query().Get("userID")
        log.Printf("Received UserID: %s", userIDStr) // Log the received UserID
    
        if userIDStr == "" {
            http.Error(w, "UserID is required", http.StatusBadRequest)
            return
        }
    
        // Convert userID from string to int
        userID, err := strconv.Atoi(userIDStr)
        if err != nil {
            log.Printf("Error converting UserID: %v", err) // Log the error

            http.Error(w, "Invalid UserID format", http.StatusBadRequest)
            return
        }
    
        // Now call the GetUserInfo function with the userID
        userInfo, err := database.GetUserInfoByID(userID) // Adjust this function if needed
        if err != nil {
            http.Error(w, fmt.Sprintf("Failed to get user info: %v", err), http.StatusInternalServerError)
            return
        }
    
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(userInfo)
    })
    

    http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
            http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
            return
        }

        var credentials struct {
            Username string `json:"username"`
            Password string `json:"password"`
        }

        if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
            http.Error(w, "Invalid request body", http.StatusBadRequest)
            return
        }

        role, err := database.Login(credentials.Username, credentials.Password)
        if err != nil {
            http.Error(w, fmt.Sprintf("Login failed: %v", err), http.StatusUnauthorized)
            return
        }

        // Redirect based on the role
        redirectPath := "/homepage"
        if role == "admin" {
            redirectPath = "/adminpage"
        }
        http.Redirect(w, r, redirectPath, http.StatusFound)
    })
    

   
 

    http.HandleFunc("/adminpage", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintln(w, "Welcome to the Admin Page!")
    })

    http.HandleFunc("/homepage", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintln(w, "Welcome to the Home Page!")
    })

    log.Println("Starting server on :8080...")
    if err := http.ListenAndServe(":8080", nil); err != nil {
        log.Fatalf("Failed to start server: %v", err)
    }
}
