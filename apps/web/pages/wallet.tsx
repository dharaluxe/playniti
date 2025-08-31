export default function Wallet(){
  return <main style={{padding:24}}>
    <h2>Wallet</h2>
    <p>NitiCoins: 1200 (demo)</p>
    <button onClick={()=>alert('Redeem request sent. Admin will issue vouchers if stock allows.')}>Redeem as Voucher</button>
  </main>;
}
