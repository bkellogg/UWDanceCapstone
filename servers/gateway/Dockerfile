FROM alpine
RUN apk add --no-cache ca-certificates
COPY gateway gateway
COPY templates/ /templates/
EXPOSE 443
ENTRYPOINT ["/gateway"]