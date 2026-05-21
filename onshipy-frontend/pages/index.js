export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/register',
      permanent: false,
    },
  };
}

export default function Home() {
  return null;
}
