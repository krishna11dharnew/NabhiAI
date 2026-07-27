import proxy from "express-http-proxy";

export const proxyWithUser = (serviceUrl) => {
  return proxy(serviceUrl, {
    limit: "50mb",  // ✅ YAHAN YE LINE ADD KAREIN (PayloadTooLargeError fix karne ke liye)

    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      if (srcReq.user) {
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
        proxyReqOpts.headers["x-user-email"] = srcReq.user.email;
        proxyReqOpts.headers["x-user-avatar"] = srcReq.user.avatar;
      }
      return proxyReqOpts;
    }
  });
};