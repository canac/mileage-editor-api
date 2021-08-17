import mongoose from 'mongoose';

// Allow empty strings to pass validation
mongoose.Schema.Types.String.checkRequired(
  (value) => typeof value === 'string',
);

const {
  DB_PROTOCOL: protocol,
  DB_HOST: host,
  DB_USER: user,
  DB_PASS: password,
} = process.env;

// eslint-disable-next-line import/prefer-default-export
export async function connect(): Promise<void> {
  if ((user && !password) || (!user && password)) {
    throw new Error(
      'Database user and password must either both be specified or neither',
    );
  }

  if (!protocol) {
    throw new Error('Database protocol was not specified');
  }

  if (!host) {
    throw new Error('Database host was not specified');
  }

  const auth = user && password ? `${user}:${password}@` : '';
  const uri = `${protocol}://${auth}${host}/mileageEditor?retryWrites=true&w=majority`;
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}
