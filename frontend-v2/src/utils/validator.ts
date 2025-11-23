type Function = (
  value: string,
  type: "email" | "password" | "username" | "url"
) => boolean

export const validator: Function = (value, type) => {
  switch (type) {
    case "email": {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRe.test(value)
    }
    case "password": {
      // require at least 8 characters (adjust as needed)
      return value.length >= 8
    }
    case "username": {
      // allow letters, numbers and underscore, between 3 and 20 chars
      const usernameRe = /^[a-zA-Z0-9_]{3,20}$/
      return usernameRe.test(value)
    }
    case "url": {
      try {
        const url = new URL(value)
        if (url.protocol !== "http" && url.protocol !== "https") return false
        return true
      } catch (err) {
        return false
      }
    }
    default:
      return false
  }
}
