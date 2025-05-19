import React from 'react';
import { useOutletContext } from 'react-router-dom';

const DashboardPage = () => {
  const { dark } = useOutletContext();

  return (
    <div className={`p-4 rounded duration-300 ease-in-out shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)] ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
      <p className="text-sm">
        Dashboard content goes here.<br></br> Lorem ipsum dolor, sit amet consectetur adipisicing elit. Minus atque earum, ab quo quod libero nihil cumque vero consectetur asperiores et deleniti voluptatibus numquam tenetur sunt veritatis ex odit dolores.<br></br> Lorem ipsum, dolor sit amet consectetur adipisicing elit. Similique id cupiditate unde consequuntur ex debitis nisi culpa perspiciatis! Nulla sunt nostrum aliquid iure laboriosam quia voluptatem quas, itaque aperiam doloremque quo possimus. Recusandae sapiente praesentium iste blanditiis perferendis soluta vitae qui, accusantium distinctio ut voluptatibus est sunt totam, sint dicta minima ad, quisquam consequatur doloremque? Repudiandae ipsam porro quod. Reiciendis nostrum repellendus nisi maiores, dolorem non, quam repellat quibusdam odio dolor voluptatem fuga atque enim velit fugit ratione iusto quas magnam, inventore doloremque minima consectetur tempore assumenda unde? Minima neque ullam et tempore quod illum. Ea tenetur eveniet temporibus, sint aliquid velit voluptates, deleniti numquam officia facilis voluptas eum quibusdam inventore et porro! Architecto natus magni ipsa iste earum iure consequatur temporibus. Optio ad, officia nam consequatur voluptatum totam et maiores aliquam consequuntur nesciunt suscipit eaque ea, dignissimos, unde nulla repudiandae blanditiis! Autem consequatur dicta quo accusantium nam ullam eius?
      </p>
    </div>
  );
};

export default DashboardPage;
