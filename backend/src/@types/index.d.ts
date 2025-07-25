import { UserDocument } from "../models/user.model";

// JWT Payload interface
export interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

// Custom Request interface with file upload support
export interface RequestWithFile extends Express.Request {
  file?: Express.Multer.File;
  user?: Express.User;
}

// Module declarations for packages without proper types
declare module 'passport' {
  interface AuthenticateOptions {
    successRedirect?: string;
    failureRedirect?: string;
    failureFlash?: boolean;
    successFlash?: boolean;
    session?: boolean;
  }

  interface Strategy {
    name?: string;
    authenticate(req: Express.Request, options?: any): any;
  }

  interface Passport {
    use(strategy: Strategy): this;
    use(name: string, strategy: Strategy): this;
    serializeUser<TUser>(fn: (user: TUser, done: (err: any, id?: any) => void) => void): void;
    deserializeUser<TUser>(fn: (id: any, done: (err: any, user?: TUser | false) => void) => void): void;
    authenticate(strategy: string | string[], options?: AuthenticateOptions): any;
    initialize(): any;
    session(): any;
  }

  const passport: Passport;
  export = passport;
}

declare module 'passport-local' {
  import { Strategy as PassportStrategy } from 'passport';
  
  interface IStrategyOptions {
    usernameField?: string;
    passwordField?: string;
    session?: boolean;
  }

  interface IVerifyOptions {
    message: string;
  }

  interface VerifyFunction {
    (username: string, password: string, done: (error: any, user?: any, options?: IVerifyOptions) => void): void;
  }

  class Strategy extends PassportStrategy {
    constructor(options: IStrategyOptions, verify: VerifyFunction);
    constructor(verify: VerifyFunction);
  }
}

declare module 'cors' {
  interface CorsOptions {
    origin?: boolean | string | RegExp | (string | RegExp)[] | ((origin: string, callback: (err: Error | null, allow?: boolean) => void) => void);
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    credentials?: boolean;
    maxAge?: number;
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
  }

  function cors(options?: CorsOptions): any;
  export = cors;
}

declare module 'cookie-parser' {
  function cookieParser(secret?: string | string[], options?: any): any;
  export = cookieParser;
}

declare module 'bcrypt' {
  function hash(data: string, saltOrRounds: string | number): Promise<string>;
  function compare(data: string, encrypted: string): Promise<boolean>;
  function genSalt(rounds?: number): Promise<string>;
  function hashSync(data: string, saltOrRounds: string | number): string;
  function compareSync(data: string, encrypted: string): boolean;
  function genSaltSync(rounds?: number): string;
}

declare module 'jsonwebtoken' {
  interface SignOptions {
    algorithm?: string;
    expiresIn?: string | number;
    notBefore?: string | number;
    audience?: string | string[];
    subject?: string;
    issuer?: string;
    jwtid?: string;
    keyid?: string;
    header?: object;
    noTimestamp?: boolean;
  }

  interface VerifyOptions {
    algorithms?: string[];
    audience?: string | RegExp | (string | RegExp)[];
    clockTimestamp?: number;
    clockTolerance?: number;
    complete?: boolean;
    issuer?: string | string[];
    ignoreExpiration?: boolean;
    ignoreNotBefore?: boolean;
    jwtid?: string;
    nonce?: string;
    subject?: string;
    maxAge?: string | number;
  }

  function sign(payload: string | object | Buffer, secretOrPrivateKey: any, options?: SignOptions): string;
  function verify(token: string, secretOrPublicKey: any, options?: VerifyOptions): any;
  function decode(token: string, options?: any): any;
}

declare global {
  namespace Express {
    interface User extends UserDocument {
      _id?: any;
      userId?: string;
    }
    
    interface Request {
      user?: User;
      logIn(user: User, done: (err: any) => void): void;
      logout(done: (err: any) => void): void;
      isAuthenticated(): boolean;
    }
  }
}
