"use server";
import { redirect } from "next/navigation";
import { saveMeal } from "./meals";
import { revalidatePath } from "next/cache";

//server action only executes on a server

function isInvaildText(text) {
  // checking user input
  return !text || text.trim() === "";
}

export async function shareMeal(prevState, formData) {
  // useActionState pass 2 parameters
  const meal = {
    title: formData.get("title"),
    summary: formData.get("summary"),
    instructions: formData.get("instructions"),
    image: formData.get("image"),
    creator: formData.get("name"),
    creator_email: formData.get("email"),
  };
  if (
    isInvaildText(meal.title) ||
    isInvaildText(meal.summary) ||
    isInvaildText(meal.instructions) ||
    isInvaildText(meal.creator) ||
    isInvaildText(meal.creator_email) ||
    !meal.creator_email.includes("@") ||
    !meal.image ||
    meal.image.size === 0
  ) {
    return {
      message: "Invalid input.", //return resoinses in sv Action
    };
  }
  await saveMeal(meal);
  revalidatePath("/meals"); // throws away the cache that belong to meals
  // Calll revalidatePath whenever you change some data to make sure that the latest data is fetched
  redirect("/meals");
}
