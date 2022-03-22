import Link from "next/link";

export default function Footer() {
  return (
    <div className="footer_bottom">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 footer_about_section">
            <h3>
              <b>About OpenStore</b>
            </h3>
            <p className="text-justify about_footer">
              OpenStore is an NFT marketplace deployed on Polygon testnet.
            </p>
            <a href="https://github.com/rgab1508/OpenStore">
              <button id="commonbuttons">
                <b>Know More</b>
              </button>
            </a>
          </div>
          <div className="col-md-4 footer_quicklinks_section">
            <h3>
              <b>Quick Links</b>
            </h3>
            <ul className="footer-links">
              <li>
                <a href="https://github.com/rgab1508/OpenStore">Source code</a>
              </li>
              <li>
                <Link href="/about">About Us</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <br />
      <br />
    </div>
  );
}
