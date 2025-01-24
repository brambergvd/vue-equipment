import { reactive, toValue, type MaybeRef, type Reactive } from 'vue'
import { useCookies } from '@vueuse/integrations/useCookies'
import { slugify } from '@maas/vue-equipment/utils'
import type { MagicCookie, MappedCookies } from '../../types'

type UseCookieStateArgs = {
  id: MaybeRef<string>
  cookies?: MagicCookie[]
  maxAge?: number
}

type CookieState = Reactive<{
  cookies: MagicCookie[]
  maxAge: number | undefined
}>

// Global API state to manage cookies and maxAge
const cookieState: CookieState = reactive({
  cookies: [],
  maxAge: undefined,
})

export function useCookieState(args: UseCookieStateArgs) {
  const { id, cookies, maxAge } = args

  // @vueuse/integrations/useCookies
  const universalCookies = useCookies([toValue(id)])
  const browserCookies: MappedCookies =
    universalCookies.get(toValue(id))?.cookies ?? {}

  if (cookies && !Array.isArray(cookies)) {
    console.warn('Invalid configuration. ‘cookies‘ must be an array.')
  }

  function initializeState() {
    // Initialize maxAge
    cookieState.maxAge = maxAge

    // Initialize cookies
    cookieState.cookies =
      cookies?.map((cookie) => {
        const savedCookie = browserCookies[cookie.key]
        let value = cookie.value

        switch (true) {
          case cookie.optional === false:
            value = true
            break
          default:
            value = savedCookie ?? cookie.value
        }

        const key = slugify(cookie.key, {
          separator: '_',
          lowercase: true,
          strict: true,
        })

        return {
          ...cookie,
          value,
          key,
        }
      }) ?? []
  }

  return {
    initializeState,
    cookieState,
  }
}
