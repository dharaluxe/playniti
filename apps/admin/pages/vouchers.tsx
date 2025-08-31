export default function Vouchers(){
  return <main style={{padding:24}}>
    <h2>Voucher Management</h2>
    <button onClick={()=>alert('Voucher generated: VCHR-TEST-1234')}>Generate Voucher</button>
  </main>;
}
