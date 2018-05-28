package appvars

const (
	HeaderContentType                = "Content-Type"
	HeaderAccessControlAllowOrigin   = "Access-Control-Allow-Origin"
	HeaderAccessControlAllowHeaders  = "Access-Control-Allow-Headers"
	HeaderAccessControlExposeHeaders = "Access-Control-Expose-Headers"
	HeaderAccessControlAllowMethods  = "Access-Control-Allow-Methods"
)

const (
	CORSAllowedOrigins = "*"
	CORSAllowedMethods = "OPTIONS, GET, POST, PATCH, DELETE, LINK, UNLINK, PUT, LOCK, UNLOCK"
	CORSAllowedHeaders = "Content-Type, Authorization, ImageFieldName, ResumeFieldName"
	CORSExposedHeaders = "Authorization, " + HeaderStrictTransportSecurity
)

const (
	HeaderStrictTransportSecurity = "Strict-Transport-Security"
	StrictTransportSecurity       = "max-age=31536000; includeSubDomains"
)

const (
	CharsetUTF8               = "; charset=utf-8"
	ContentTypeJSON           = "application/json"
	ContentTypeJSONUTF8       = ContentTypeJSON + CharsetUTF8
	ContentTypeTextPlain      = "text/plain"
	ContentTypeTextPlainUTF8  = ContentTypeTextPlain + CharsetUTF8
	ContentTypeImageJPEG      = "image/jpeg"
	ContentTypeApplicationPDF = "application/pdf"
)
