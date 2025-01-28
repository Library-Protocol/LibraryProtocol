import { usePrivy } from '@privy-io/react-auth';

function ConnectWalletButton() {
  const { ready, authenticated, login, logout } = usePrivy();

  const handleClick = () => {
    if (authenticated) {
      // Disconnect the wallet if the user is authenticated
      logout();
    } else {
      // Connect the wallet if the user is not authenticated
      login();
    }
  };

  if (!ready) {
    // Optionally render a loading state if Privy is not ready
    return <button disabled className="bg-gray-600 text-white px-4 py-2 rounded">Loading...</button>;
  }

  return (
    <button
      onClick={handleClick}
      className="
        bg-black
        text-white
        hover:bg-gray-800
        focus:outline-none
        focus:ring-2
        focus:ring-white
        rounded
        px-4
        py-2
        transition
        duration-200
      "
    >
      {authenticated ? 'Logout' : 'Connect Wallet'}
    </button>
  );
}

export default ConnectWalletButton;
