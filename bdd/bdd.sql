CREATE TABLE Users (
    uid VARCHAR(255) PRIMARY KEY,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    email VARCHAR(255),
    birthdate DATE,
    isAdmin BOOLEAN,
    profileImage TEXT
);

-- Create Sessions Table
CREATE TABLE Sessions (
    sessionId VARCHAR(255) PRIMARY KEY,
    sessionName VARCHAR(255)
);

-- Create Attendance Records Table
CREATE TABLE AttendanceRecords (
    recordId INT AUTO_INCREMENT PRIMARY KEY,
    sessionId VARCHAR(255),
    uid VARCHAR(255),
    mood VARCHAR(50),
    time TIMESTAMP,
    FOREIGN KEY (sessionId) REFERENCES Sessions(sessionId),
    FOREIGN KEY (uid) REFERENCES Users(uid)
);

-- Create Absence Records Table
CREATE TABLE AbsenceRecords (
    recordId INT AUTO_INCREMENT PRIMARY KEY,
    sessionId VARCHAR(255),
    uid VARCHAR(255),
    mood VARCHAR(50),
    time TIMESTAMP,
    FOREIGN KEY (sessionId) REFERENCES Sessions(sessionId),
    FOREIGN KEY (uid) REFERENCES Users(uid)
);