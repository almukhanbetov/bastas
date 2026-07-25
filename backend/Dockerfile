FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/api ./cmd/api
RUN CGO_ENABLED=0 go build -o /out/migrate ./cmd/migrate

FROM alpine:3.20
WORKDIR /app
COPY --from=builder /out/api ./api
COPY --from=builder /out/migrate ./migrate
COPY migrations ./migrations
EXPOSE 8080
CMD ["./api"]
