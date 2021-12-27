import { OAuth2Client, TokenPayload } from "google-auth-library";
import { GoogleUser } from "./../types/interfaces";

/**
 * Verifies and decodes the jwt token
 * @param token jwt token
 * @returns a promise that resolves with a google user or undefined
 */
async function verify(token: string): Promise<GoogleUser | undefined> {
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload: TokenPayload | undefined = ticket.getPayload();
    if (payload) {
      const { email, family_name: firstName, given_name: lastName, picture } = payload;
      if (email && lastName && firstName && picture) {
        const googleUser = { firstName, lastName, picture, email };
        return googleUser;
      }
    }

    return undefined;
  } catch (error) {
    return undefined;
  }
}

export default verify;
