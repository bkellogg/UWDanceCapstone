FROM alpine
RUN apk add --no-cache ca-certificates
RUN apk add -U tzdata
ENV TZ=America/Los_Angeles
COPY gateway gateway
COPY templates/ /templates/
RUN mkdir -p /static/images/users/
RUN mkdir -p /static/resumes/
EXPOSE 443
ENTRYPOINT ["/gateway"]