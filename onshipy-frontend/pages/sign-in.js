export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/login',
      permanent: true,
    },
  };
}

export default function SignInRedirect() {
  return null;
}
