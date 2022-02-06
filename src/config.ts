import { Tedis, TedisPool } from "tedis";


function newConfig(redisHost: string, redisPort: number) {
  try {
    const tedis = new Tedis({
      host: redisHost,
      port: redisPort,
    });
    return tedis
  } catch (e) {
    console.error(e)
    throw e
  }
}


async function userActive(t: Tedis, id: string) {
  try {
    const _userActive = await t.get(id)
    return typeof _userActive === "string" || typeof _userActive === "number"
  } catch (e) {
    console.error(e)
    return false
  }
}


async function enableUser(t: Tedis, id: string) {
  try {
    await t.del(id)
  } catch (e) {
    throw e; console.error(e)
  }
}


async function disableUser(t: Tedis, id: string) {
  try {
    await t.set(id, JSON.stringify(true))
  } catch (e) {
    throw e; console.error(e)
  }
}


async function channelActive(t: Tedis, id: string) {
  try {
    const _channelActive = await t.get(id)
    return typeof _channelActive === "string" || typeof _channelActive === "number"
  } catch (e) {
    console.error(e)
    return false
  }
}


async function enableChannel(t: Tedis, id: string) {
  try {
    await t.del(id)
  } catch (e) {
    console.error(e); throw e
  }
}


async function disableChannel(t: Tedis, id: string) {
  try {
    await t.set(id, JSON.stringify(true))
  } catch (e) {
    console.error(e); throw e
  }
}


async function storeIPInfo(t: Tedis, info: any) {
  try {
    const encoded = JSON.stringify(info)
    await t.set(`ip/${info.IP}`, encoded)
  } catch (e) {
    console.error(e); throw e
  }
}


async function getIPInfo(t: Tedis, ip: string) {
  try {
    const ipinfoStr = await t.get(`ip/${ip}`)
    if (ipinfoStr === null || typeof ipinfoStr === "number") {
      return [{IP: ""}, false, null]
    } else {
      const info = JSON.parse(ipinfoStr)
      return [info, true, null]
    }
  } catch (e) {
    console.error(e); throw e
  }
}


async function storeUserIP(t: Tedis, userId: string, ip: string) {
  try {
    await t.set(`userip/${userId}`, ip)
  } catch (e) {
    console.error(e); throw e
  }
}

async function getUserIp(t: Tedis, userId: string) {
  try {
    const ip = await t.get(`userip/${userId}`)
    if (ip !== null && typeof ip !== "number") {
      return [ip, false, null]
    } else {
      return ["", true, null]
    }
  } catch (e) {
    console.error(e); throw e
  }
}


async function getUserIPInfo(t: Tedis, userId: string) {
  try {
    const ip = await getUserIp(t, userId)
    if (ip === null || typeof ip === "number") {
      return [{IP: ip}, false, null]
    } else {
      //const info = JSON.parse(ip)
      return [{IP: ""}, true, null]
    }
  } catch (e) {
    console.error(e); throw e
  }
}


async function registerActiveUserInChannel(t: Tedis, channelId: string, userId: string) {
  await t.sadd(`active_channel_members/${channelId}`, userId)
}


async function getActiveUsersInChannel(t: Tedis, channelId: string) {
  return await t.smembers(`active_channel_members/${channelId}`)
}
