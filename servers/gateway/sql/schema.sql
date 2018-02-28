CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE KEY,
    Bio VARCHAR(750) NOT NULL,
    PassHash BINARY(60) NOT NULL,
    Role TINYINT NOT NULL,
    Active BOOLEAN NOT NULL,
    CreatedAt DATETIME NOT NULL
);

CREATE TABLE Auditions (
    AuditionID INT AUTO_INCREMENT PRIMARY KEY,
    AuditionName varchar (50) NOT NULL UNIQUE KEY,
    AuditionDate varchar(20) NOT NULL,
    AuditionTime varchar(20) NOT NULL,
    AuditionLocation varchar(100) NOT NULL,
    Quarter VARCHAR(10) NOT NULL,
    Year VARCHAR(4) NOT NULL,
    CreatedAt DATETIME NOT NULL,
    CreatedBy INT NOT NULL,
    IsDeleted BOOLEAN NOT NULL
);

CREATE TABLE Shows (
    ShowID INT AUTO_INCREMENT PRIMARY KEY,
    ShowName varchar(50) NOT NULL UNIQUE KEY,
    AuditionID INT,
    EndDate DATETIME NOT NULL,
    CreatedAt DATETIME NOT NULL,
    CreatedBy INT NOT NULL,
    IsDeleted BOOLEAN NOT NULL,
    FOREIGN KEY (AuditionID) REFERENCES Auditions(AuditionID)
);

CREATE TABLE Pieces (
    PieceID INT AUTO_INCREMENT PRIMARY KEY,
    PieceName varchar(50) NOT NULL UNIQUE KEY,
    ShowID INT,
    CreatedAt DATETIME NOT NULL,
    CreatedBy INT NOT NULL,
    IsDeleted BOOLEAN NOT NULL,
    FOREIGN KEY (ShowID) REFERENCES Shows(ShowID)
);

CREATE TABLE UserPiece (
    UserPieceID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    PieceID INT NOT NULL,
    CreatedAt DATETIME NOT NULL,
    IsDeleted BOOLEAN NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (PieceID) REFERENCES Pieces(PieceID)
);

CREATE TABLE UserAudition (
    UserAuditionID INT AUTO_INCREMENT PRIMARY KEY,
    AuditionID INT NOT NULL,
    UserID INT NOT NULL,
    CreatedAt DATETIME NOT NULL,
    IsDeleted BOOLEAN NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (AuditionID) REFERENCES Auditions(AuditionID)
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
    AnnouncementTypeDesc varchar(150) NULL
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


INSERT INTO AnnouncementType(AnnouncementTypeName, AnnouncementTypeDesc) VALUES ("admin", "Announcements made by an admin."),
    ("audition", "Automated announcements about an audition"), ("show", "Automated announcements about a show"),
    ("piece", "Automated announcements about a piece")
