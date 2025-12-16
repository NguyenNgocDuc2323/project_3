IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'BackendDb')
BEGIN
    CREATE DATABASE BackendDb;
END
GO

USE BackendDb;
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Examples')
BEGIN
    CREATE TABLE Examples (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL
    );
END
GO

