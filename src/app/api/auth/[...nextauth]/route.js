import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "../../../../../prisma/prisma";

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: {
          type: "text",
          label: "Email",
        },
        password: {
          type: "password",
          label: "Password",
        },
      },
      async authorize(credentials) {
        try {
          const user = await prisma.user.findFirst({
            where: {
              username: credentials.email,
              password: credentials.password,
            },
          });
          if (user) {
            return user;
          }
        } catch (err) {
          console.log(err);
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider == "credentials") {
        return true;
      } else {
        return false;
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.userId = user.id;
        token.password = user.password;
        token.role = user.role;
        token.gender = user.gender;
        token.name = user.name;
        token.schoolId = user.schoolId;
        token.teacherOf = user.teacherOf;
        token.classes = user.classes;
        token.imageUrl = user.imageUrl;
        token.subjects = user.subjects;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.username = token.username;
        session.user.userId = token.userId;
        session.user.gender = token.gender;
        session.user.password = token.password;
        session.user.role = token.role;
        session.user.classes = token.classes;
        session.user.schoolId = token.schoolId;
        session.user.teacherOf = token.teacherOf;
        session.user.imageUrl = token.imageUrl;
        session.user.subjects = token.subjects;
      }
      return session.user;
    },
  },
};
export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
