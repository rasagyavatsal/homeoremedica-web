#!/usr/bin/env bash

set -euo pipefail

readonly project="homeoremedica"
readonly region="us-central1"
readonly service="homeoremedica-chat"
readonly bucket="homeoremedica-private-remedies"
readonly service_account_name="homeoremedica-chat"
readonly service_account="${service_account_name}@${project}.iam.gserviceaccount.com"
readonly allowed_origins="https://homeoremedica-web--homeoremedica.us-central1.hosted.app,https://homeoremedica-web-preview--homeoremedica.us-central1.hosted.app"

gcloud services enable \
  artifactregistry.googleapis.com \
  aiplatform.googleapis.com \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  --project="${project}" \
  --quiet

if ! gcloud iam service-accounts describe "${service_account}" \
  --project="${project}" >/dev/null 2>&1; then
  gcloud iam service-accounts create "${service_account_name}" \
    --display-name="HomeoRemedica chat Cloud Run runtime" \
    --project="${project}"
fi

gcloud storage buckets add-iam-policy-binding "gs://${bucket}" \
  --member="serviceAccount:${service_account}" \
  --role="roles/storage.objectViewer" \
  --project="${project}" \
  --quiet >/dev/null

gcloud projects add-iam-policy-binding "${project}" \
  --member="serviceAccount:${service_account}" \
  --role="roles/aiplatform.user" \
  --condition=None \
  --quiet >/dev/null

gcloud run deploy "${service}" \
  --source=rag \
  --project="${project}" \
  --region="${region}" \
  --service-account="${service_account}" \
  --allow-unauthenticated \
  --cpu=1 \
  --memory=512Mi \
  --min=0 \
  --max=1 \
  --concurrency=20 \
  --timeout=120 \
  --port=8080 \
  --set-env-vars="^@^RAG_PROJECT=${project}@RAG_LOCATION=${region}@RAG_BUCKET=${bucket}@RAG_CACHE_DIR=/tmp/homeoremedica-rag-corpus@RAG_ALLOWED_ORIGINS=${allowed_origins}" \
  --quiet

service_url="$(gcloud run services describe "${service}" \
  --project="${project}" \
  --region="${region}" \
  --format='value(status.url)')"

curl --fail --silent --show-error --retry 12 --retry-delay 5 "${service_url}/health"
printf '\n%s\n' "${service_url}"
