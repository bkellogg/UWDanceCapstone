package constants

const (
	HeaderContentType                = "Content-Type"
	HeaderAccessControlAllowOrigin   = "Access-Control-Allow-Origin"
	HeaderAccessControlAllowHeaders  = "Access-Control-Allow-Headers"
	HeaderAccessControlExposeHeaders = "Access-Control-Expose-Headers"
	HeaderAccessControlAllowMethods  = "Access-Control-Allow-Methods"
	HeaderAccessControlMaxAge        = "Access-Control-Max-Age"
)

const (
	CharsetUTF8              = "; charset=utf-8"
	ContentTypeJSON          = "application/json"
	ContentTypeJSONUTF8      = ContentTypeJSON + CharsetUTF8
	ContentTypeTextPlain     = "text/plain"
	ContentTypeTextPlainUTF8 = ContentTypeTextPlain + CharsetUTF8
	ContentTypeTextHTML      = "text/html"
	ContentTypeTextHTMLUTF8  = ContentTypeTextHTML + CharsetUTF8
)
