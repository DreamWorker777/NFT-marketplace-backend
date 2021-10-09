const db = require("../models");

const sendEmail = require("../utils/email/sendEmail");
const clientURL = process.env.CLIENT_URL;
const ChatHistory = db.chatHistory;
const User = db.user;

exports.sendTicket = async (req, res) => {
    const sender = req.userId;

    const old = await ChatHistory.findOne({ sender: sender, type: 'ticket' }).exec();

    const content = req.body.ticketContent;
    const type = old ? 'chat' : 'ticket';
    const read = 0;
    const sent_at = new Date().toUTCString();
    const receiver = old ? old.receiver : null;

    await new ChatHistory({
        sender,
        content,
        type,
        read,
        sent_at,
        receiver
    }).save();

    return res.status(200).send({
        success: true,
    });
}

exports.getContacts = async (req, res) => {
    const userId = req.userId;
    const chats = await ChatHistory.find({ $or: [
        { receiver: null, type: 'ticket' }, { receiver: userId, type: 'ticket' } 
    ] }).populate('sender', "-__v").exec();
    
    const contacts = [];
    chats.forEach(async (chat) => {
        const contact = {};
        contact.ticketId = chat._id;

        const temp = await ChatHistory.find({
            $or: [
                { sender: chat.sender._id, receiver: userId, read: 0 },
                { sender: chat.sender._id, receiver: null, read: 0 }
            ]
            
        }).exec();

        contact.unread = temp.length;

        contact.sender = chat.sender;

        const messages = await ChatHistory.find({
            $or: [
                { sender: chat.sender._id, receiver: null }, { sender: chat.sender._id, receiver: userId }, { sender: userId, receiver: chat.sender._id }
            ]
        })

        contact.lastMsg = messages[ messages.length - 1 ];

        contacts.push(contact);

        if( contacts.length === chats.length ) {
            return res.status(200).send({
                contacts
            })
        }
    })
}

exports.getChat = async( req, res ) => {
    const ticketId = req.params.ticketId;
    const userId = req.userId;

    const ticket = await ChatHistory.findById( ticketId );
    if( !ticket.receiver ) {
        ticket.receiver = userId;
        ticket.read = 1;
        ticket.save();
    }
    
    await ChatHistory.updateMany({ sender: ticket.sender, receiver: userId }, { read: 1 });

    const chatData = await ChatHistory.find({ 
        $or: [
            { sender: ticket.sender, receiver: userId },
            { sender: userId, receiver: ticket.sender }
        ]
    }).exec();

    return res.status(200).send({
        chat: chatData
    })
}

exports.sendMessage = async (req, res) => {
    const receiver = req.body.receiverId;
    const content = req.body.message;
    const userId = req.userId;
    const type = 'chat';
    const read = 0;
    const sent_at = new Date().toUTCString();

    await new ChatHistory({
        sender: userId,
        receiver: receiver,
        content: content,
        type: type,
        read: read,
        sent_at: sent_at,
    }).save();

    const chatData = await ChatHistory.find({ 
        $or: [
            { sender: receiver, receiver: userId },
            { sender: userId, receiver: receiver }
        ]
    }).exec();

    const user = await User.findById( receiver ).exec();

    const link = `${clientURL}/chat`;
    sendEmail(
        user.email,
        "Truhelix.com",
        {
          name: user.username,
          link: link,
        },
        "./template/receiveMessage.handlebars"
    );

    return res.status(200).send({
        chat: chatData
    })
}

exports.getUserContacts = async (req, res) => {
    const userId = req.userId;

    const chats = await ChatHistory.find({ 
        sender: userId, type: 'ticket', read: 1
     }).populate('receiver', "-__v").exec();
    
    const contacts = [];
    chats.forEach(async (chat) => {
        const contact = {};
        contact.ticketId = chat._id;

        const temp = await ChatHistory.find({
            sender: chat.receiver._id, receiver: userId, read: 0
        }).exec();

        contact.unread = temp.length;

        contact.sender = chat.receiver;

        const messages = await ChatHistory.find({
            $or: [
                { sender: chat.receiver._id, receiver: userId }, { sender: userId, receiver: chat.receiver._id }
            ]
        })

        contact.lastMsg = messages[ messages.length - 1 ];

        contacts.push(contact);
        
        if( contacts.length === chats.length ) {
            return res.status(200).send({
                contacts
            })
        }
    })
}

exports.getUserChat = async( req, res ) => {
    const contactUserId = req.params.userId;
    const userId = req.userId;
    
    await ChatHistory.updateMany({ sender: contactUserId, receiver: userId }, { read: 1 });

    const chatData = await ChatHistory.find({ 
        $or: [
            { sender: contactUserId, receiver: userId },
            { sender: userId, receiver: contactUserId }
        ]
    }).exec();

    return res.status(200).send({
        chat: chatData
    })
}

exports.sendUserMessage = async( req, res ) => {
    const receiver = req.body.receiverId;
    const content = req.body.message;
    const userId = req.userId;
    const type = 'chat';
    const read = 0;
    const sent_at = new Date().toUTCString();

    await new ChatHistory({
        sender: userId,
        receiver: receiver,
        content: content,
        type: type,
        read: read,
        sent_at: sent_at,
    }).save();

    const chatData = await ChatHistory.find({ 
        $or: [
            { sender: receiver, receiver: userId },
            { sender: userId, receiver: receiver }
        ]
    }).exec();

    return res.status(200).send({
        chat: chatData
    })
}