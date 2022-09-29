const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/UserModels");

exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10) // bcrypt.hash permet de haché le mdp et 10 (le salt) c'est le nombre de tour, plus il y a de tour plus cela prendra de temps
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() =>
          res.status(201).json({ message: "Utilisateur enregistré !" })
        )
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      // compart la valeur avec les valeurs dans la base de donné,
      if (user === null) {
        // si nul l'utilisateur ne c'est pas inscrit donc erreur 401 +
        // message vague pour eviter de donné l'info que l'utilisateur n'est pas enregistré, pour évité une fuite de donnée.
        res
          .status(401)
          .json({ mesage: "Paire identifiant/mot de passe incorrect" });
      } else {
        // si une valeur est présente dans la base de donné, il faut comparé le mot de passe.
        bcrypt
          .compare(req.body.password, user.password)
          .then((valid) => {
            // si la valeur est differente, retourner une erreur 401
            // retourné le même message d'erreur pour ne pas donné d'information
            // un utilisateur malveillant ne pourra pas savoir
            // si l'utilisateur n'est pas inscris ou que le mot de passe est incorrect.
            if (!valid) {
              res
                .status(401)
                .json({ mesage: "Paire identifiant/mot de passe incorrect" });
            } else {
              //si le mot de passe est correct retourner un status 200
              // ainsi qu'un objet contenant l'userId + un token
              // qui servira au authentification des futur requetes émise par l'utilisateur
              res.status(200).json({
                userId: user._id,
                token: jwt.sign(
                  { iserId: user._id }, //identifier de l'utilisateur pour êtres sur la requete est bien celle d'utilisateur
                  "RANDOM_TOKEN_SECRET", //clef secrete pour l'encodage
                  { expiresIn: "24" } // appliquer une expiration du tokern (au bout de 24h le token ne serra plus considéré comme valable)
                ),
              });
            }
          })
          // Attention les erreur renvoyés sont des erreurs d'éxecution de requete de base de donné
          // ce n'est pas une erreur renvoyer si il n'y pas pas de champ trouvé dans la base de donné ( utilisateur n'existe pas )
          .catch((error) => res.status(500).json({ error }));
      }
    })
    // Attention le aussi ! les erreur renvoyés sont des erreurs d'éxecution de requete de base de donné
    // ce n'est pas une erreur renvoyer si il n'y pas pas de champ trouvé dans la base de donné ( utilisateur n'existe pas )
    .catch((error) => res.status(500).json({ error }));
};
