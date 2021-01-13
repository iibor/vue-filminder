<template>
  <div>
    <v-overlay :value="isLoading">
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
    <v-container>
      <v-card>
        <v-container>
          <h2>Partner Search</h2>
          <p>Search a partner by email</p>
          <v-row>
            <v-form ref="form" v-model="form">
              <v-col class="d-inline-flex">
                <v-text-field
                  v-model="email"
                  :rules="[rules.email]"
                  filled
                  label="Email Address"
                  type="email"
                ></v-text-field>
                <v-btn
                  @click="searchUserByEmail"
                  :disabled="!form"
                  large
                  color="primary"
                  class="ml-2 mt-2"
                >
                  Search
                </v-btn>
              </v-col>
            </v-form>
          </v-row>
          <v-row v-if="foundUser">
            <v-col class="d-inline-flex">
              <v-card>
                <v-card-text>
                  <div>{{ foundUser.email }}</div>
                  <p class="display-1 text-primary">
                    {{ foundUser.name }}
                  </p>
                  <div class="text-primary">
                    To add this user as a partner, click the add button below.
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="primary" @click="addUserAsPartner(foundUser.id)"
                    >Add</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
          <v-row v-if="message">
            <v-col>
              <h3>{{ message }}</h3>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
      <v-snackbar
        :timeout="3000"
        :value="showToast"
        absolute
        bottom
        right
        :color="toastColor"
        >{{ toastMessages }}</v-snackbar
      >
    </v-container>
  </div>
</template>

<script>
import { db } from "../main";
export default {
  data: () => {
    return {
      form: false,
      isLoading: false,
      showToast: false,
      toastColor: "",
      toastMessages: "",
      email: "",
      foundUser: null,
      message: "",
      rules: {
        email: (v) => !!(v || "").match(/@/) || "Please enter a valid email",
      },
    };
  },
  methods: {
    async searchUserByEmail() {
      this.isLoading = true;
      this.message = "";
      this.foundUser = null;

      const snapshot = await db
        .collection("users")
        .where("email", "==", this.email.toLowerCase())
        .get();

      if (!snapshot.empty) {
        const userId = snapshot.docs[0].id;
        const userData = snapshot.docs[0].data();

        this.foundUser = {
          id: userId,
          ...userData,
        };
      } else {
        this.message = "No user found";
      }
      this.isLoading = false;
    },
    async addUserAsPartner(id) {
      try {
        const authUserId = this.$store.state.user.id;
        await db.collection("users").doc(authUserId).update({ partnerId: id });

        this.$store.dispatch("user/setPartnerId", id);

        this.toastColor = "success";
        this.toastMessages = "Partner added successfully";
        this.showToast = true;
      } catch (error) {
        this.toastColor = "red";
        this.toastMessages = "An error occurred, please try again!";
        this.showToast = true;
      }
    },
  },
};
</script>