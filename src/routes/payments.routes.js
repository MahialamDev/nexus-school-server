const express = require("express");
const router = express.Router();
const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");
const stripe = require("stripe")(`${process.env.payment_scerect}`);

router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection("payments").find().toArray();
    res.send(result);
  } catch (err) {
    console.log(err);
  }
});

// stripe payments
const MY_DOMAIN = process.env.site_domain;

router.post("/create-checkout-session", async (req, res) => {
  const paymentInfo = req.body;
  const db = getDB();

  const infoFromDB = await db
    .collection("payments")
    .findOne({ _id: new ObjectId(paymentInfo._id) });
    

  // amount convert
  const amount = Math.round(Number(infoFromDB?.amount * 100));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        // Provide the exact Price ID (for example, price_1234) of the product you want to sell
        price_data: {
          currency: "bdt",

          product_data: {
            name: paymentInfo?.payments_title || "Error vai from name",
            description: paymentInfo?.description || "Error vai",
          },
          unit_amount: amount,
        },

        quantity: 1,
      },
    ],

    metadata: {
      name: paymentInfo?.name || "Error vai",
      email: paymentInfo?.email || "Error vai",
      student_id: paymentInfo?.student_id?.toString() || "Error vai",
      payment_id: infoFromDB?._id?.toString(),
    },
    customer_email: paymentInfo?.email || "Error vai",
    mode: "payment",
    success_url: `${MY_DOMAIN}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${MY_DOMAIN}/dashboard/payment-cancel`,
  });

  res.status(200).json({ url: session.url });
});



// retrive

router.post('/payment-success', async (req, res) => {
    const db = getDB();
    const sessionId = req.query.session_id;
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    console.log(session)

    const query = {
        transition_id: session.payment_intent
    }
    const paymentExist = await db.collection('payment-success').findOne(query);
    if (paymentExist) {
        return res.send({message: "Already Payment."})
    }

    if (session.payment_status === 'paid') {
        
        const insertInfo = {
            name:  session.metadata.name,
            email:  session.metadata.email,
            student_id: session.metadata.student_id,
            payment_status: session.payment_status,
            transition_id: session.payment_intent,
            amount: session.amount_total,
            payment_id: session.metadata.payment_id,
            paymentAt: new Date()

        }

        const result = await db.collection('payment-success').insertOne(insertInfo);
         res.send({result,  transition_id: session.payment_intent,  amount: session.amount_total })
    }
})



// post payment by admin

router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const paymentInfo = req.body;
    const result = await db.collection("payments").insertOne(paymentInfo);
    res.send(result);
  } catch (err) {
    console.log(err);
  }
});



// my payments see by student

router.get("/my-payments", async (req, res) => {
  try {
    const db = getDB();
    const { class_name, email } = req.query;
    console.log(class_name);
    const paymentInfo = await db.collection("payments").find({ class_name }).toArray();

    const paidPayments = await db.collection("payment-success").find({ email }).toArray();

    const paidIds = paidPayments.map(p => p.payment_id);
    
    const result = paymentInfo.map(payment => ({
      ...payment, 
      paid: paidIds.includes(payment._id.toString())
    }))

    res.send(result)
    
  } catch (err) {
    console.log(err);
  }
});

router.delete("/:id/delete", async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const query = { _id: new ObjectId(id) };
    console.log(query);

    const result = await db.collection("payments").deleteOne(query);
    console.log(result);
    res.send(result);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
