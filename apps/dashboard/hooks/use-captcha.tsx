import type HCaptcha from "@hcaptcha/react-hcaptcha"
import type { TurnstileInstance } from "@marsidev/react-turnstile"
import { type RefObject,  useRef } from "react"


// Default captcha endpoints
const DEFAULT_CAPTCHA_ENDPOINTS = ["/sign-up", "/login", "/forget-password"]


export type CaptchaProvider =
    | "cloudflare-turnstile"
    | "hcaptcha"

type Captcha = {
    siteKey: string
    provider: CaptchaProvider
    hideBadge?: boolean
    recaptchaNet?: boolean
    enterprise?: boolean
    /**
     * Overrides the default array of paths where captcha validation is enforced
     * @default ["/sign-up", "/login", "/forget-password"]
     */
    endpoints?: string[]
}



// Sanitize action name for reCAPTCHA
// Google reCAPTCHA only allows A-Za-z/_ in action names
const sanitizeActionName = (action: string): string => {
    // First remove leading slash if present
    let result = action.startsWith("/") ? action.substring(1) : action

    // Convert both kebab-case and path separators to camelCase
    // Example: "/login/email" becomes "signInEmail"
    result = result
        .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
        .replace(/\/([a-z])/g, (_, letter) => letter.toUpperCase())
        .replace(/\//g, "")
        .replace(/[^A-Za-z0-9_]/g, "")

    return result
}

export function useCaptcha() {
   
const captcha: Captcha = {
    siteKey: "0x4AAAAAAA00000000",
    provider: "cloudflare-turnstile",
    hideBadge: false,
    recaptchaNet: false,
    enterprise: false,
}
    // biome-ignore lint/suspicious/noExplicitAny:
    const captchaRef = useRef<any>(null)

    const executeCaptcha = async (action: string) => {
        if (!captcha) throw new Error('Missing captcha response')

        // Sanitize the action name for reCAPTCHA
        let response: string | undefined | null

        switch (captcha.provider) {
            
            
            case "cloudflare-turnstile": {
                const turnstileRef = captchaRef as RefObject<TurnstileInstance>
                response = turnstileRef.current.getResponse()
                break
            }
            case "hcaptcha": {
                const hcaptchaRef = captchaRef as RefObject<HCaptcha>
                response = hcaptchaRef.current.getResponse()
                break
            }
        }

        if (!response) {
            throw new Error('Missing captcha response')
        }

        return response
    }

    const getCaptchaHeaders = async (action: string) => {
        if (!captcha) return undefined

        // Use custom endpoints if provided, otherwise use defaults
        const endpoints = captcha.endpoints || DEFAULT_CAPTCHA_ENDPOINTS

        // Only execute captcha if the action is in the endpoints list
        if (endpoints.includes(action)) {
            return { "x-captcha-response": await executeCaptcha(action) }
        }

        return undefined
    }

    return {
        captchaRef,
        getCaptchaHeaders
    }
}
