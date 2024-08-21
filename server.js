// server.js

const { PrismaClient } = require('@prisma/client');
const express = require('express');
const cors = require('cors'); // Import du middleware cors

const app = express();
const prisma = new PrismaClient();

// Configuration de CORS pour autoriser toutes les origines
app.use(cors());

// Middleware pour analyser le JSON dans les requêtes
app.use(express.json());

app.post('/updateCartStatus', async (req, res) => {
  const { email, username, en_attente, email_envoye } = req.body;

  if (!email || !username) {
    return res.status(400).json({ message: 'Email and username are required' });
  }

  try {
    // Rechercher un enregistrement avec email et username
    const existingCart = await prisma.cart.findFirst({
      where: {
        email: email,
        username: username,
      },
    });

    if (existingCart) {
      // Si l'enregistrement existe, mettre à jour la valeur `en_attente`
      await prisma.cart.update({
        where: {
          id: existingCart.id, // Mise à jour basée sur l'ID de l'enregistrement existant
        },
        data: {
          en_attente: en_attente, // Correctement spécifié dans l'objet `data`
          email_envoye: email_envoye,
          date_du_panier: new Date(),
        },
      });
    } else {
      // Si l'enregistrement n'existe pas, créer un nouvel enregistrement
      await prisma.cart.create({
        data: {
          email,
          username,
          en_attente,
          email_envoye,
        },
      });
    }

    return res.status(200).json({ message: 'Cart status updated successfully' });
  } catch (error) {
    console.error('Error updating cart status:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
});

// Démarrer le serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
