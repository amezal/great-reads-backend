import dotenv from 'dotenv';
dotenv.config();
import jwt from 'express-jwt';
import jwks from 'jwks-rsa';
import axios from 'axios';

export async function getUserInfo(req, res, next) {
  const url = req.user.aud[1];
  const userInfo = await axios.get(url, {
    headers: {
      Authorization: req.headers.authorization
    }
  });

  req.userInfo = userInfo.data;
  next();
}

export const checkJwt = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.DOMAIN}.well-known/jwks.json`
  }),
  audience: process.env.AUDIENCE,
  issuer: process.env.DOMAIN,
  algorithms: ['RS256'],
})
