import supabase from "./supabaseClient.js";

// add
// "type": "module",
// to package.json

async function supabaseTest() {
    // {
    //   const { data, error } = await supabase.from("games").select("*");
    //   console.log(data, error);
    // }

    // {
    //   const { data, error } = await supabase.auth.signInAnonymously();
    //   console.log(data, error);
    // }

  //   {
  //     const roomOne = supabase.channel("room-one");
  //     roomOne.send({
  //       type: "broadcast",
  //       event: "test",
  //       payload: { message: "hello, baby" },
  //     });
  //   }

  //   {
  //     const channel = supabase.channel("room-one");

  //     channel
  //       .on("broadcast", { event: "cursor-pos" }, (payload) => {
  //         console.log("Cursor position received!", payload);
  //       })
  //       .subscribe((status) => {
  //         if (status === "SUBSCRIBED") {
  //           channel.send({
  //             type: "broadcast",
  //             event: "cursor-pos",
  //             payload: { x: Math.random(), y: Math.random() },
  //           });
  //         }
  //       });
  //   }

  //   {
  //     const roomOne = supabase.channel("room-one");
  //     const presenceTrackStatus = await roomOne.track({
  //       user: "user-1",
  //       online_at: new Date().toISOString(),
  //     });
  //   }

//   {
//     const allChanges = supabase
//       .channel("games")
//       .on(
//         "postgres_changes",
//         {
//           event: "*",
//           schema: "public",
//         },
//         (payload) => console.log(payload)
//       )
//       .subscribe();
//   }
// {
//     const channels = supabase.getChannels()
//     console.log(channels)
// }

}

supabaseTest();
