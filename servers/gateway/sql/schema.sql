CREATE TABLE Role (
    RoleID INT AUTO_INCREMENT PRIMARY KEY,
    RoleName VARCHAR(20) NOT NULL UNIQUE KEY,
    RoleDisplayName varchar(25) NOT NULL UNIQUE KEY,
    RoleLevel INT NOT NULL,
    IsDeleted BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE KEY,
    Bio VARCHAR(750) NOT NULL,
    PassHash BINARY(60) NOT NULL,
    RoleID INT NOT NULL,
    Active BOOLEAN NOT NULL,
    CreatedAt DATETIME NOT NULL,
    FOREIGN KEY (RoleID) REFERENCES Role(RoleID)
);

CREATE TABLE Auditions (
    AuditionID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR (50) NOT NULL UNIQUE KEY,
    Time DATETIME NOT NULL,
    Location VARCHAR(100) NOT NULL,
    Quarter VARCHAR(10) NOT NULL,
    CreatedAt DATETIME NOT NULL,
    CreatedBy INT NOT NULL,
    IsDeleted BOOLEAN NOT NULL
);

CREATE TABLE ShowType (
    ShowTypeID INT AUTO_INCREMENT PRIMARY KEY,
    ShowTypeName varchar(50) NOT NULL UNIQUE KEY,
    ShowTypeDesc varchar(150) NULL,
    CreatedAt DATETIME NOT NULL,
    CreatedBy INT NOT NULL,
    IsDeleted BOOLEAN NOT NULL
);

CREATE TABLE Shows (
    ShowID INT AUTO_INCREMENT PRIMARY KEY,
    ShowTypeID INT NOT NULL,
    EndDate DATETIME NOT NULL,
    CreatedAt DATETIME NOT NULL,
    CreatedBy INT NOT NULL,
    IsDeleted BOOLEAN NOT NULL,
    FOREIGN KEY (ShowTypeID) REFERENCES ShowType(ShowTypeID)
);

CREATE TABLE Pieces (
    PieceID INT AUTO_INCREMENT PRIMARY KEY,
    ChoreographerID INT,
    PieceName varchar(50) NOT NULL UNIQUE KEY,
    ShowID INT NOT NULL,
    CreatedAt DATETIME NOT NULL,
    CreatedBy INT NOT NULL,
    IsDeleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (ShowID) REFERENCES Shows(ShowID)
);

CREATE TABLE UserPiece (
    UserPieceID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    PieceID INT NOT NULL,
    RoleID INT NOT NULL,
    CreatedAt DATETIME NOT NULL,
    IsDeleted BOOLEAN NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (PieceID) REFERENCES Pieces(PieceID),
    FOREIGN KEY (RoleID) REFERENCES Role(RoleID)
);

CREATE TABLE UserAuditionAvailability (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Sunday VARCHAR(250) NOT NULL,
    Monday VARCHAR(250) NOT NULL,
    Tuesday VARCHAR(250) NOT NULL,
    Wednesday VARCHAR(250) NOT NULL,
    Thursday VARCHAR(250) NOT NULL,
    Friday VARCHAR(250) NOT NULL,
    Saturday VARCHAR(250) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT NOW(),
    IsDeleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE UserAudition (
    UserAuditionID INT AUTO_INCREMENT PRIMARY KEY,
    AuditionID INT NOT NULL,
    UserID INT NOT NULL,
    AvailabilityID INT NOT NULL,
    CreatedBy INT NOT NULL,
    CreatedAt DATETIME NOT NULL,
    IsDeleted BOOLEAN NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (AuditionID) REFERENCES Auditions(AuditionID),
    FOREIGN KEY (AvailabilityID) REFERENCES UserAuditionAvailability(ID)
);

CREATE TABLE UserAuditionComment (
    CommentID INT AUTO_INCREMENT PRIMARY KEY,
    UserAuditionID INT NOT NULL,
    Comment VARCHAR(150) NOT NULL,
    CreatedAt DATETIME NOT NULL,
    CreatedBy INT NOT NULL,
    IsDeleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (UserAuditionID) REFERENCES UserAudition(UserAuditionID)
);

CREATE TABLE Errors (
    ErrorID INT AUTO_INCREMENT PRIMARY KEY,
    ErrTime DATETIME NOT NULL,
    ErrRemoteAddr VARCHAR (25) NOT NULL,
    ErrRequestMethod VARCHAR (25) NOT NULL,
    ErrRequestURI VARCHAR (100) NOT NULL,
    ErrCode INT NOT NULL,
    ErrMessage VARCHAR(150) NOT NULL
);

CREATE TABLE AnnouncementType (
    AnnouncementTypeID INT AUTO_INCREMENT PRIMARY KEY,
    AnnouncementTypeName varchar(25) NOT NULL,
    AnnouncementTypeDesc varchar(150) NULL,
    CreatedAt DATETIME NOT NULL,
    CreatedBy INT NOT NULL,
    IsDeleted BOOLEAN NOT NULL
);

CREATE TABLE Announcements (
    AnnouncementID INT AUTO_INCREMENT PRIMARY KEY,
    AnnouncementTypeID INT NOT NULL,
    Message varchar(500) NOT NULL,
    CreatedAt DATETIME NOT NULL,
    CreatedBy INT NOT NULL,
    IsDeleted Boolean NOT NULL,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (AnnouncementTypeID) REFERENCES AnnouncementType(AnnouncementTypeID)
);

-- CREATE DEFAULT NECESSARY VALUES
INSERT INTO Role (RoleName, RoleDisplayName, RoleLevel, IsDeleted) VALUES
    ('admin', 'Administrator', 100, FALSE),
    ('chor', 'Choreographer', 70, FALSE),
    ('user', 'Dancer', 10, FALSE);