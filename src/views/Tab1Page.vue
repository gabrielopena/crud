<template>
  <ion-page>
    <ion-content :fullscreen="true" class="crud-page">
      <div class="page-shell">
        <div class="hero-panel">
          <span class="dashboard-label">DASHBOARD</span>
          <h1>Stopybai GaeBai List</h1>
          <div class="stats-pill">
            <span>{{ items.length }}</span>
            <small>ITEMS</small>
          </div>
        </div>

        <div class="panel form-panel">
          <h2 class="panel-title">{{ isEditing ? 'Update Item' : 'Add new Band' }}</h2>

          <div class="field-group">
            <label class="field-label">Title</label>
            <ion-input v-model="title" class="custom-input" placeholder="" />
          </div>

          <div class="field-group">
            <label class="field-label">Description</label>
            <ion-textarea v-model="description" class="custom-input custom-textarea" auto-grow rows="3" placeholder="" />
          </div>

          <div class="action-row">
            <ion-button expand="block" class="primary-btn" @click="saveItem">
              {{ isEditing ? 'Update Item' : 'Save Item' }}
            </ion-button>

            <ion-button v-if="isEditing" fill="clear" color="medium" @click="resetForm">
              Cancel
            </ion-button>
          </div>
        </div>

        <div class="panel list-panel">
          <h3 class="list-title">Recent items</h3>

          <div v-if="items.length === 0" class="empty-state">
            <p>No items yet.</p>
          </div>

          <div v-else class="items-list">
            <div v-for="(item, index) in items" :key="item.id" class="list-item">
              <div class="item-badge">#{{ items.length - index }}</div>

              <div class="meta-block">
                <div class="meta-title">{{ item.title }}</div>
                <div class="meta-desc">{{ item.description || 'No description' }}</div>
              </div>

              <div class="item-actions">
                <button class="mini-btn edit-btn" type="button" @click="editItem(item)">EDIT</button>
                <button class="mini-btn delete-btn" type="button" @click="deleteItem(item.id)">DELETE</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import {
  IonPage,
  IonContent,
  IonInput,
  IonTextarea,
  IonButton,
} from '@ionic/vue';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { db } from '@/firebase';

type Item = {
  id: string;
  title: string;
  description: string;
};

const title = ref('');
const description = ref('');
const items = ref<Item[]>([]);
const isEditing = ref(false);
const editingId = ref<string | null>(null);

const itemsCollection = collection(db, 'items');
let unsubscribe: (() => void) | undefined;

const resetForm = () => {
  title.value = '';
  description.value = '';
  isEditing.value = false;
  editingId.value = null;
};

const saveItem = async () => {
  const trimmedTitle = title.value.trim();
  const trimmedDescription = description.value.trim();

  if (!trimmedTitle) {
    return;
  }

  try {
    if (isEditing.value && editingId.value) {
      await updateDoc(doc(db, 'items', editingId.value), {
        title: trimmedTitle,
        description: trimmedDescription,
        updatedAt: serverTimestamp(),
      });
    } else {
      await addDoc(itemsCollection, {
        title: trimmedTitle,
        description: trimmedDescription,
        createdAt: serverTimestamp(),
      });
    }

    resetForm();
  } catch (error) {
    console.error('Error saving item:', error);
  }
};

const editItem = (item: Item) => {
  title.value = item.title;
  description.value = item.description;
  isEditing.value = true;
  editingId.value = item.id;
};

const deleteItem = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'items', id));

    if (editingId.value === id) {
      resetForm();
    }
  } catch (error) {
    console.error('Error deleting item:', error);
  }
};

onMounted(() => {
  const q = query(itemsCollection, orderBy('createdAt', 'desc'));

  unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      items.value = snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        title: docSnapshot.data().title ?? '',
        description: docSnapshot.data().description ?? '',
      }));
    },
    (error) => {
      console.error('Error listening to Firestore items:', error);
    },
  );
});

onUnmounted(() => {
  unsubscribe?.();
});
</script>

<style scoped>
:global(body) {
  background: #0f0f12;
}

ion-page {
  --background: transparent;
}

.crud-page {
  --background: #0f0f12;
}

.page-shell {
  width: min(100%, 1180px);
  margin: 0 auto;
  padding: 28px 18px 40px;
}

.hero-panel {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 12px 20px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 18px 22px 18px 20px;
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.18);
  margin-bottom: 22px;
}

.dashboard-label {
  grid-column: 1 / 2;
  display: inline-block;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.72rem;
  letter-spacing: 0.12rem;
  font-weight: 700;
  text-transform: uppercase;
}

.hero-panel h1 {
  grid-column: 1 / 2;
  margin: 0;
  color: #ffffff;
  font-size: clamp(2.2rem, 3.2vw, 4rem);
  line-height: 1.02;
  letter-spacing: -0.06em;
  font-weight: 800;
}

.stats-pill {
  grid-column: 2 / 3;
  grid-row: 1 / span 2;
  align-self: center;
  justify-self: end;
  width: 108px;
  min-height: 104px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #ffffff;
  text-align: center;
}

.stats-pill span {
  display: block;
  font-size: 2.2rem;
  line-height: 1;
  font-weight: 800;
}

.stats-pill small {
  display: block;
  margin-top: 8px;
  font-size: 0.7rem;
  letter-spacing: 0.1rem;
  opacity: 0.75;
}

.panel {
  background: #f2f2f2;
  border-radius: 28px;
  border: 2px solid rgba(0, 0, 0, 0.9);
  box-shadow: 0 18px 18px rgba(0, 0, 0, 0.08);
}

.form-panel {
  padding: 18px 26px 22px;
}

.panel-title {
  margin: 6px 0 18px;
  text-align: center;
  color: #000000;
  font-size: clamp(1.7rem, 2vw, 2.3rem);
  font-weight: 800;
  line-height: 1.2;
}

.field-group {
  margin-bottom: 18px;
}

.field-label {
  display: block;
  margin: 0 0 10px;
  color: #000000;
  font-size: 1.05rem;
  font-weight: 600;
}

.custom-input {
  width: 100%;
  min-height: 54px;
  border-radius: 12px;
  border: 2px solid rgba(0, 0, 0, 0.9);
  background: rgba(255, 255, 255, 0.18);
  --background: rgba(255, 255, 255, 0.18);
  --color: #000000;
  --placeholder-color: #666666;
  --padding-start: 18px;
  --padding-end: 18px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  color: #000000;
}

.custom-textarea {
  min-height: 110px;
}

ion-input::part(native),
ion-textarea::part(native) {
  min-height: 54px;
  color: #000000;
  padding-left: 0;
  padding-right: 0;
  font-size: 1rem;
}

ion-input:focus-within,
ion-textarea:focus-within {
  border-color: #000000;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
}

.action-row {
  margin-top: 16px;
}

.primary-btn {
  --border-radius: 16px;
  --background: linear-gradient(180deg, #050505 0%, #000000 100%);
  --background-hover: #1a1a1a;
  --box-shadow: none;
  --padding-top: 16px;
  --padding-bottom: 16px;
  --color: #ffffff;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.list-panel {
  margin-top: 22px;
  padding: 10px 18px 18px;
}

.list-title {
  margin: 14px 0 16px;
  text-align: center;
  color: #000000;
  font-size: clamp(1.7rem, 2vw, 2.2rem);
  font-weight: 800;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.list-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  background: #f5f5f5;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 18px;
  padding: 12px 16px;
}

.item-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #efefef;
  color: #000000;
  font-weight: 800;
  font-size: 1.1rem;
}

.meta-block {
  min-width: 0;
}

.meta-title {
  color: #000000;
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.3;
}

.meta-desc {
  color: #3d3d3d;
  font-size: 0.95rem;
  margin-top: 4px;
}

.item-actions {
  display: flex;
  gap: 14px;
  align-items: center;
}

.mini-btn {
  border: none;
  background: transparent;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
}

.edit-btn {
  color: #101010;
}

.delete-btn {
  color: #db2d2d;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90px;
  color: #000000;
  font-weight: 600;
}

@media (max-width: 720px) {
  .hero-panel {
    grid-template-columns: 1fr;
  }

  .dashboard-label,
  .hero-panel h1,
  .stats-pill {
    grid-column: auto;
    grid-row: auto;
    justify-self: start;
  }

  .stats-pill {
    width: 86px;
    min-height: 90px;
  }
}
</style>
