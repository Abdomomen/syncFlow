let fetching = async (url, method = "GET", body = null, token) => {
  try {
    let res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : null,
    });

    let data = await res.json();

    if (data.success) {
      return data;
    }

    if (data.message === "Invalid Token") {
      let refresh = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      let refreshData = await refresh.json();

      if (!refreshData.success) {
        return { error: "session expired" };
      }

      let newRes = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshData.token}`,
        },
        body: body ? JSON.stringify(body) : null,
      });

      let newData = await newRes.json();

      if (newData.success) {
        return { ...newData, newToken: refreshData.token, success: true };
      } else {
        return { error: "session expired" };
      }
    }
    return data;
  } catch (error) {
    return { error: "Network error occurred", details: error.message };
  }
};

export default fetching;
