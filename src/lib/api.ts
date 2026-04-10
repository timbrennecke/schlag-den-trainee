import { supabase } from "./supabase";
import { Config, Trainee, Game } from "./types";

export async function fetchConfig(): Promise<Config> {
  const { data, error } = await supabase
    .from("config")
    .select("*")
    .eq("id", 1)
    .single();
  if (error) throw error;
  return data;
}

export async function updateConfig(
  updates: Partial<Omit<Config, "id">>
): Promise<Config> {
  const { data, error } = await supabase
    .from("config")
    .update(updates)
    .eq("id", 1)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchTrainees(): Promise<Trainee[]> {
  const { data, error } = await supabase
    .from("trainees")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data;
}

export async function addTrainee(
  name: string,
  sort_order: number
): Promise<Trainee> {
  const { data, error } = await supabase
    .from("trainees")
    .insert({ name, sort_order })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTrainee(
  id: string,
  updates: Partial<Pick<Trainee, "name" | "avatar_url" | "sort_order">>
): Promise<Trainee> {
  const { data, error } = await supabase
    .from("trainees")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function reorderTrainees(orderedIds: string[]): Promise<void> {
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("trainees")
      .update({ sort_order: index + 1 })
      .eq("id", id)
  );
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}

export async function deleteTrainee(id: string): Promise<void> {
  const { error } = await supabase.from("trainees").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadAvatar(
  traineeId: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${traineeId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function fetchGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .order("created_at");
  if (error) throw error;
  return data;
}

export async function fetchGamesByTrainee(
  traineeId: string
): Promise<Game[]> {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("trainee_id", traineeId)
    .order("group_number");
  if (error) throw error;
  return data;
}

export async function submitGameResult(
  traineeId: string,
  groupNumber: number,
  winner: "trainee" | "group"
): Promise<Game> {
  const { data, error } = await supabase
    .from("games")
    .upsert(
      { trainee_id: traineeId, group_number: groupNumber, winner },
      { onConflict: "trainee_id,group_number" }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAllGames(): Promise<void> {
  const { error } = await supabase
    .from("games")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) throw error;
}

export async function fetchAllData(): Promise<{
  config: Config;
  trainees: Trainee[];
  games: Game[];
}> {
  const [config, trainees, games] = await Promise.all([
    fetchConfig(),
    fetchTrainees(),
    fetchGames(),
  ]);
  return { config, trainees, games };
}
