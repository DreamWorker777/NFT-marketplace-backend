const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");
const nftController = require("../controllers/nftlink.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  //user routes
  app.get("/api/test/all", controller.allAccess);

  app.post("/api/user/profileImage", [authJwt.verifyToken], controller.changeImage);

  app.get("/api/user/all", controller.getAllusers);

  app.post("/api/user/profileUpdate", [authJwt.verifyToken], controller.updateProfileDetail);

  app.get("/api/test/user", [authJwt.verifyToken], controller.userBoard);

  app.get(
    "/api/test/mod",
    [authJwt.verifyToken, authJwt.isModerator],
    controller.moderatorBoard
  );

  app.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );

  //nftdata routes
  app.post("/api/nftdata/create", [authJwt.verifyToken], nftController.nftupload);
  app.get("/api/nftdata/getall",  [authJwt.verifyToken], nftController.getAllNfts);
  app.get("/api/nftdata/get/:nftid",  [authJwt.verifyToken], nftController.getbyNFT);
  app.get("/api/nftdata/getbyUser",  [authJwt.verifyToken], nftController.getbyUser);
  app.get("/api/nftdata/savefile", nftController.uploadAsset);
  app.get("/api/nftdata/genhash", nftController.genhash);
};
