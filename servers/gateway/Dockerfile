FROM alpine
RUN apk add --no-cache ca-certificates
RUN apk add -U tzdata
ENV TZ=America/Los_Angeles
COPY gateway gateway
RUN mkdir -p /static/images/users/
RUN mkdir -p /static/resumes/
RUN mkdir -p /static/assets/
RUN mkdir -p /config/
COPY config/app.ini /config/app.ini
EXPOSE 443
ENTRYPOINT ["/gateway"]