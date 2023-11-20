# Use Go 1.21 as base image
FROM golang:1.21

# Set the working directory
WORKDIR /app

# Copy the Kerberos configuration file
COPY krb5.conf krb5.conf

# Copy the source code
COPY go.mod go.mod
COPY go.sum go.sum
COPY main.go main.go

# Build the application
RUN go build -o main main.go

