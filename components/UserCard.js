import Image from "next/image";

export default function Card({ data, key }) {
  return (
    <div key={key} className=" mb-5 col-md-4">
      <div style={{ borderRadius: "10px" }} className="card shadow margin-56">
        <Image
          className="card-img-top display-image-card"
          src={data.image}
          alt="Card image cap"
          width={200}
          height={250}
          objectFit="contain"
        />
        <div className="card-body">
          <h5 className="card-title" id="namepr{{i.id}}">
            {data.name}
          </h5>
          <h5 className="card-title">
            {data.price} <b>ETH</b>
          </h5>
          <br />
          <p className="card-text">{data.desc}</p>
        </div>
      </div>
    </div>
  );
}
