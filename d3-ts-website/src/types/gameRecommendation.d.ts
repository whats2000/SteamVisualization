export type GameRecommendation = {
  success: number;
  results: {
    start_date: number;
    end_date: number;
    weeks: any[];
    rollups: {
      date: number;
      recommendations_up: number;
      recommendations_down: number;
    }[];
    rollup_type: string;
    recent: {
      date: number;
      recommendations_up: number;
      recommendations_down: number;
    }[];
  };
  count_all_reviews: boolean;
  expand_graph: boolean;
}