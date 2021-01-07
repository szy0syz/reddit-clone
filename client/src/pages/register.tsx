import Axios from 'axios';
import { error } from 'console';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import InputGroup from '../components/InputGroup';

export default function Home() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [agreement, setAgreement] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!agreement) {
      return setErrors({ ...errors, agreement: '请同意相关条款' });
    }

    try {
      const res = await Axios.post('/auth/register', {
        email,
        password,
        username,
      });
      console.log(res);
      debugger
      router.push('/login');
    } catch (error) {
      console.error(error);
      setErrors(error?.response?.data || {});
    }
  };

  return (
    <div className="flex">
      <Head>
        <title>Register - Reddit</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className="h-screen bg-center bg-cover w-36"
        style={{ backgroundImage: "url('/images/bricks.jpg')" }}
      ></div>

      <div className="flex flex-col justify-center pl-6">
        <div className="w-70">
          <h1 className="mb-2 text-lg font-medium">Sign Up</h1>
          <p className="mb-10 text-xs">
            By continuing, you agree to our{' '}
            <a href="#" className="text-blue-400">
              User Agreement
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-400">
              Privacy Policy
            </a>
            .
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <input
                type="checkbox"
                className="mr-1 cursor-pointer"
                id="agreement"
                checked={agreement}
                onChange={(e) => setAgreement(e.target.checked)}
              />
              <label htmlFor="agreement" className="text-xs cursor-pointer">
                I agree to get emails about cool stuff on Reddit
              </label>
              <small className="block font-medium text-red-500">
                {errors.agreement}
              </small>
            </div>
            <InputGroup
              placeholder="Email"
              value={email}
              setValue={setEmail}
              error={errors.email}
            />
            <InputGroup
              placeholder="Username"
              value={username}
              setValue={setUsername}
              error={errors.username}
            />
            <InputGroup
              placeholder="Password"
              value={password}
              type="password"
              setValue={setPassword}
              error={errors.password}
            />
            <button className="w-full py-2 mb-4 text-xs font-bold text-white uppercase bg-blue-500 border border-blue-500 rounded">
              Sign Up
            </button>
          </form>
          <small>
            Already a readitor?
            <Link href="/login">
              <a className="ml-1 text-blue-500 uppercase">Log In</a>
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
}
