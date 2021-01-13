<template>
  <div class="home">
    <v-card :loading="isLoading" class="mx-auto my-12" max-width="600">
      <template slot="progress">
        <v-progress-linear
          color="primary"
          height="10"
          indeterminate
        ></v-progress-linear>
      </template>
      <v-row>
        <v-col md="6"><v-img :src="movieImage"></v-img></v-col>
        <v-col md="6" class="mt-5">
          <v-card-title>{{ currentMovie.title }}</v-card-title>
          <v-card-text>
            <v-row align="center" class="mx-0">
              <div>{{ currentMovie.overview }}</div>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-row class="d-flex justify-space-around mt-4">
              <v-btn color="green" @click="thumpsUp">
                <v-icon>mdi-hand-okay</v-icon>
              </v-btn>
              <v-btn color="red" @click="thumpsDown">
                <v-icon>mdi-hand-pointing-down</v-icon>
              </v-btn>
            </v-row>
          </v-card-actions>
        </v-col>
      </v-row>
    </v-card>
    <v-row>
      <v-col class="text-center"
        >Powered by
        <a href="https://www.themoviedb.org/">The Movie Database</a></v-col
      >
    </v-row>
  </div>
</template>

<script>
// @ is an alias to /src
import axios from "axios";
import { db } from "../main";
export default {
  name: "Home",
  data: () => {
    return {
      isLoading: false,
      movies: [],
      currentMovie: {},
      currentIndex: 0,
    };
  },
  created() {
    this.$store.dispatch("user/bindMatchesRef");
    this.fetchMovies(this.userMovieApiPage);
  },
  methods: {
    async fetchMovies(page) {
      const res = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=57fb50d9335d50ef51a139c9e1acd3f6&language=en-US&sort_by=popularity.desc&include_adult=true&include_video=false&page=${page}`
      );

      if (res.data && res.data.results.length > 0) {
        this.movies = res.data.results;
        this.currentMovie = this.movies[0];
      }
    },
    async incrementCurrentIndex() {
      if (this.currentIndex === this.movieResultsLength - 1) {
        const newPage = this.userMovieApiPage + 1;
        await db
          .collection("users")
          .doc(this.authUserId)
          .update({ movieApiPage: newPage });

        this.$store.dispatch("user/setMovieApiPage", newPage);
        this.fetchMovies(newPage);
        this.currentIndex = 0;
      } else {
        this.currentIndex++;
        this.currentMovie = this.movies[this.currentIndex];
      }
    },
    async thumpsUp() {
      let userRef = db.collection("users").doc(this.authUserId);

      await userRef.collection("likedMovies").add({ ...this.currentMovie });

      if (this.partnerId) {
        let partnerRef = db.collection("users").doc(this.partnerId);
        const partnerLikedSnapshot = await partnerRef
          .collection("likedMovies")
          .where("id", "==", this.currentMovie.id)
          .get();

        if (!partnerLikedSnapshot.empty) {
          await userRef.collection("matches").add({ ...this.currentMovie });
          await partnerRef.collection("matches").add({ ...this.currentMovie });
        }
      }
      this.incrementCurrentIndex();
    },
    async thumpsDown() {
      await this.incrementCurrentIndex();
    },
  },
  computed: {
    movieResultsLength() {
      return this.movies.length;
    },
    userMovieApiPage() {
      return this.$store.state.user.movieApiPage;
    },
    authUserId() {
      return this.$store.state.user.id;
    },
    partnerId() {
      return this.$store.state.user.partnerId;
    },
    movieImage() {
      return this.currentMovie.poster_path
        ? `https://image.tmdb.org/t/p/w500/${this.currentMovie.poster_path}`
        : "";
    },
  },
};
</script>
