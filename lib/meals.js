import fs from "node:fs"; // Work with file system

import sql from "better-sqlite3";
import slugify from "slugify"; // When creating dynamic routes or generating links
import xss from "xss"; // Remove harmful content

const db = sql("meals.db");

export async function getMeals() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  // throw new Error("Loading meals failed"); test handle error function
  return db.prepare("SELECT * FROM meals").all();
}

export function getMeal(slug) {
  return db.prepare("SELECT * FROM meals WHERE slug = ?").get(slug);
}

export async function saveMeal(meal) {
  //store both file and data in the database
  meal.slug = slugify(meal.title, { lower: true });
  meal.instructions = xss(meal.instructions);

  const extension = meal.image.name.split(".").pop(); //meal.image has their own name property, this line use to separate file name and file extension
  const fileName = ` ${meal.slug}.${extension}`; //generate file name

  const stream = fs.createWriteStream(`public/images/${fileName}`); // allows us to write data to a certain file
  const bufferedImage = await meal.image.arrayBuffer(); // convert img to buffer

  stream.write(Buffer.from(bufferedImage), (error) => {
    // we need buffer for the write method
    if (error) {
      throw new Error("Saving image failed!");
    }
  });
  meal.image = `/images/${fileName}`;
  db.prepare(
    // insert data form meal into the db
    `INSERT INTO meals (title, summary, instructions, creator, creator_email, image, slug)
    VALUES( 
      @title, 
      @summary, 
      @instructions, 
      @creator, 
      @creator_email, 
      @image, 
      @slug
    )
  `
  ).run(meal);
}
