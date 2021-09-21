const db = require("../models");
const Nftlink = db.nftlink;


exports.allAccess = (req, res) => {
    res.status(200).send("public content.");
};


exports.nftupload = async (req, res) => {
    const userid = req.userId;
    const filers = require('fs');
    const crypto = require('crypto');
    const privatekey = (new Date()).valueOf().toString();
    const publickey = req.body.token;
    const cyptoResult = crypto.createHash('sha1').update(privatekey + publickey).digest('hex');
    const content = Buffer.from(req.body.file, 'base64');
    const data = filers.writeFileSync(`./nftDatas/${cyptoResult}.png`, content);
    const nftlink = new Nftlink({
        datalink: cyptoResult,
        publickey: req.body.token,
        privatekey: privatekey,
        byuser: userid,
    })

    nftlink.save((err, nftdata) => {
        if(err) {
            res.status(500).send({message: err});
            return;
        }
        res.send({message: 'Success', data: nftdata});
    });
}

exports.getAllNfts = async (req, res) => {
    const allnftdata = await Nftlink.find().exec();
    res.status(200).send({nftdata: allnftdata});
}

exports.getbyId = async (req, res) => {
    const nftid = req.params.nftid;
    const nftdatabyId = await Nftlink.findById(nftid).exec();
    res.status(200).send({data: nftdatabyId});
}

exports.getbyUser = async (req, res) => {
    const userId = req.userId;
    const allnftdatabyUser = await Nftlink.find({
        byuser: userId
    }).exec()
    res.status(200).send({data: allnftdatabyUser});
}

exports.getbyNFT = async(req, res) => {
    const nft = req.params.nftid;
    const userId = req.userId;
    console.log(nft.toLowerCase());
    const nftData = await Nftlink.findOne({'publickey': nft});
    console.log(nftData);
    if(nftData != null){
        const fs = require('fs');
        const contents = fs.readFileSync(`./nftDatas/${nftData.datalink}.png`, {encoding: 'base64'});
        res.status(200).send({conten: contents});
    }else{
        res.status(404).send({err: 'there is not the file'});
    }
    
}
//Test Engine
exports.uploadAsset = async (req, res) => {
    // console.log(req.body.file);
    // res.status(200).send({msg: 'The file was saved'});
    const filers = require('fs');
    // filers.writeFile("/test1.png", req.body.file, 'binary', function (err) {
    //     if (err) {
    //         return console.log(err);
    //     }
    //     // console.log("The file was saved!");
    //     res.status(200).send({msg: 'The file was saved'});
    // });
    const content = "ipworjjlkjnonew";
    const data = filers.writeFileSync('./nftDatas/test.txt', content);
    console.log(data);
    res.status(200).send({msg: 'The file was saved'});
}

exports.genhash = async (req, res) => {
    const crypto = require('crypto');

    // const text = 'I love cupcakes';
    // const key = 'abcdeg';
    // const current_date = (new Date()).valueOf().toString();
    // console.log(current_date);
    // var random_val = Math.random().toString();
    // crypto.createHash('sha1').update(current_date + random_val).digest('hex');
    // console.log(crypto.createHash('sha1').update(current_date + random_val).digest('hex'));
    var generator = require('magic-square-generator').MagicSquare;
    var square = new generator(5); // 3 => Dimension du carré 3*3
    await square.generate();
    // console.log(square);
    res.status(200).send({msg: 'genwork'});
}