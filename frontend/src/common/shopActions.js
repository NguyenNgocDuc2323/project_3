export const POST_LOGIN_ACTION_KEY = 'postLoginAction'
export const POST_LOGIN_REDIRECT_KEY = 'postLoginRedirect'
export const BUY_NOW_ITEM_KEY = 'buyNowItem'

export const savePostLoginAction = (action) => {
  sessionStorage.setItem(POST_LOGIN_ACTION_KEY, JSON.stringify(action))
}

export const getPostLoginAction = () => {
  const rawAction = sessionStorage.getItem(POST_LOGIN_ACTION_KEY)
  if (!rawAction) {
    return null
  }

  try {
    return JSON.parse(rawAction)
  } catch {
    return null
  }
}

export const clearPostLoginAction = () => {
  sessionStorage.removeItem(POST_LOGIN_ACTION_KEY)
}

export const savePostLoginRedirect = (redirectTo) => {
  sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, redirectTo)
}

export const getPostLoginRedirect = () => {
  return sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY)
}

export const clearPostLoginRedirect = () => {
  sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY)
}

export const saveBuyNowItem = (item) => {
  sessionStorage.setItem(BUY_NOW_ITEM_KEY, JSON.stringify(item))
}

export const getBuyNowItem = () => {
  const rawItem = sessionStorage.getItem(BUY_NOW_ITEM_KEY)
  if (!rawItem) {
    return null
  }

  try {
    return JSON.parse(rawItem)
  } catch {
    return null
  }
}

export const clearBuyNowItem = () => {
  sessionStorage.removeItem(BUY_NOW_ITEM_KEY)
}
