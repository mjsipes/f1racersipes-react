import supabase from "./supabaseClient.js";

// add
// "type": "module",
// to package.json

async function supabaseTest() {
  const { data, error } = await supabase
    .from("profiles")
    .insert([{ full_name: "mm" }])
    .select();
  console.log(data);
  console.log(error);
}

supabaseTest();
