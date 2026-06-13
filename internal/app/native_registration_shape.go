package app

import (
	"log"
	"net/url"
	"strconv"
	"strings"

	waappv1 "github.com/byte-v-forge/wa-app/gen/go/byte/v/forge/waapp/v1"
)

func logNativeRegistrationOrderedShape(kind string, phone *waappv1.PhoneTarget, method waappv1.VerificationDeliveryMethod, params orderedParams) {
	if len(params) == 0 {
		return
	}
	phoneHash := ""
	if phone != nil && phone.GetE164Number() != "" {
		phoneHash = stableID(phone.GetE164Number())
	}
	log.Printf(
		"wa_registration_request_shape kind=%s phone_hash=%s method=%s field_count=%d fields=%s",
		probeLogValue(kind),
		phoneHash,
		probeLogValue(registrationMethodName(method, "sms")),
		len(params),
		registrationShapeFields(params),
	)
}

func logNativeRegistrationMapShape(kind string, phone *waappv1.PhoneTarget, method waappv1.VerificationDeliveryMethod, params map[string]string, rawKeys map[string]struct{}) {
	if len(params) == 0 {
		return
	}
	ordered := make(orderedParams, 0, len(params))
	for _, key := range stableParamOrder(params) {
		_, raw := rawKeys[key]
		ordered = append(ordered, orderedParam{key: key, val: params[key], raw: raw})
	}
	logNativeRegistrationOrderedShape(kind, phone, method, ordered)
}

func registrationShapeFields(params orderedParams) string {
	parts := make([]string, 0, len(params))
	for _, param := range params {
		mode := "form"
		if param.raw {
			mode = "raw"
		}
		parts = append(parts, param.key+":"+strconv.Itoa(registrationShapeValueLength(param.val, param.raw))+":"+mode)
	}
	return strings.Join(parts, ",")
}

func registrationShapeValueLength(value string, raw bool) int {
	if !raw {
		return len([]byte(value))
	}
	decoded, err := url.PathUnescape(value)
	if err != nil {
		return len([]byte(value))
	}
	return len([]byte(decoded))
}
