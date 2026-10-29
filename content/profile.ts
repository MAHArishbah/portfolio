/**
 * Single source of truth for everything the site renders.
 *
 * Content is drawn from Rishabh Mahajan's resume and public GitHub repos.
 * Every figure below appears on the resume or in a repo README — if you edit a
 * number here, make sure it still matches the source.
 *
 * `cluster` and `short` exist for the stage-03 knowledge map: `cluster` decides
 * which region of the map a node lands in, `short` is the chip label.
 */

export type Stage = {
  id: string;
  index: string;
  label: string;
  color: string;
  headline: string;
};

export type Role = {
  title: string;
  period: string;
  current?: boolean;
};

export type Experience = {
  org: string;
  short: string;
  /** Omit to keep this role off the stage-03 map. */
  cluster?: string;
  url?: string;
  location: string;
  kind: "employment" | "research" | "internship";
  roles: Role[];
  bullets: string[];
  tags: string[];
};

export type Project = {
  name: string;
  short: string;
  blurb: string;
  /** Doubles as the map cluster. */
  category: string;
  tags: string[];
  repo?: string;
  demo?: string;
  year?: string;
};

export type Honour = {
  short: string;
  cluster: string;
  text: string;
  tags?: string[];
};

export type Metric = {
  name: string;
  value: string;
  note: string;
  color: string;
  /**
   * Bar length, 0–1, on the row's OWN declared scale — `scale` prints under the
   * bar. A longer bar always means better, including on the rows where lower is
   * better, so the length never has to be read backwards.
   */
  fill: number;
  scale: string;
};

export type Credential = {
  title: string;
  org: string;
  period?: string;
  detail?: string;
};

export const stages: Stage[] = [
  {
    id: "ingest",
    index: "01",
    label: "Ingest",
    color: "var(--s1)",
    headline: "Raw input.",
  },
  {
    id: "extract",
    index: "02",
    label: "Extract",
    color: "var(--s2)",
    headline: "Seven years, structured.",
  },
  {
    id: "embed",
    index: "03",
    label: "Embed",
    color: "var(--s3)",
    headline: "Everything I've worked on, mapped.",
  },
  {
    id: "evaluate",
    index: "04",
    label: "Evaluate",
    color: "var(--s4)",
    headline: "Measured, not claimed.",
  },
  {
    id: "retrieve",
    index: "05",
    label: "Retrieve",
    color: "var(--s5)",
    headline: "Top-k results.",
  },
];

/**
 * Map regions. Order fixes the colour each one gets, and `x`/`y` are the
 * cluster centres in percent of the canvas.
 */
export const clusters = [
  { name: "Document AI & LLMs", color: "var(--s1)", x: 72, y: 25 },
  { name: "Production MLOps", color: "var(--s4)", x: 26, y: 26 },
  // Central region, so its label has the least room — keep the name short.
  { name: "Theory", color: "var(--s6)", x: 48, y: 54 },
  { name: "Vision", color: "var(--s3)", x: 23, y: 78 },
  { name: "Classical ML", color: "var(--s2)", x: 76, y: 76 },
];

const GH = "https://github.com/MAHArishbah";
/** The from-scratch work lives in one repo, one folder per topic. */
const SCRATCH = `${GH}/ScratchImplementations`;

export const profile = {
  // --- identity -----------------------------------------------------------
  firstName: "Rishabh",
  lastName: "Mahajan",
  handle: "rishabh",
  location: "Gurugram, IN",
  email: "rishabh7552@outlook.com",
  github: GH,
  linkedin: "https://www.linkedin.com/in/rishabh-mahajan-aa849893",
  /** Served straight from `public/` — deliberately not generated from the
   *  content below, so the resume stays the exact file you hand out. */
  resumeFile: "/resume.pdf",

  // --- hero ---------------------------------------------------------------
  headline: [
    { text: "I ship ML that " },
    { text: "survives production", em: "s1" as const },
    { text: ", and rebuild the internals " },
    { text: "from scratch", em: "s5" as const },
    { text: " to know why it works." },
  ],
  roleLine: "AI/ML Engineer",
  blurb:
    "Seven years shipping production software, owning the model lifecycle end to end — data curation, fine-tuning, evaluation, serving, drift monitoring. Domain depth in logistics, customs, and financial-crime compliance; the rest of the time I rebuild transformers from first principles to see what the abstractions hide.",

  log: [
    "$ pipeline run rishabh_mahajan.pdf",
    "✓ layout_det    4 regions        41ms",
    "✓ ocr           1,418 tokens     79ms",
    "✓ extract       schema=portfolio.v1  conf=0.96",
    "✓ embed         20 entities → latent space",
    "→ scroll to run the pipeline ↓",
  ],

  // --- stage 02: extract --------------------------------------------------
  experience: [
    {
      org: "DSV (formerly DB Schenker)",
      short: "DSV",
      cluster: "Document AI & LLMs",
      url: "https://www.dsv.com",
      location: "Gurugram, India",
      kind: "employment",
      roles: [
        { title: "AI / Software Engineer", period: "May 2023 — Present", current: true },
      ],
      bullets: [
        "Fine-tuned Qwen 2.5 7B for bill-of-lading field extraction across 60 carriers, resolving carrier-specific layouts that template-based OCR could not parse. Document-level accuracy — every field in a document correct — rose from ~75–80% with prompted GPT-4/Claude to ~90% on a strictly held-out set of ~4,000 documents.",
        "Built the training data curation pipeline over ~36,000 masked documents (~600 per carrier), fusing Azure Document Intelligence layout markdown with Kofax KTA OCR text as dual model input for measurable gains on degraded scans.",
        "Authored end-to-end training and inference code — LoRA at rank 32 across all seven linear projections in bf16, ~80M trainable parameters at 1.06% of base — validating on a carrier-level held-out split before retraining across all 60 carriers and packaging checkpoints, adapters, and inference services for Azure MLOps deployment.",
        "Engineered deterministic schema and business-rule validation in the inference layer, with automated self-correction retries on failed extractions, cutting manual review effort by 78%.",
        "Architected a parallel Azure Document Intelligence pipeline using prebuilt and custom neural models, processing ~5,000 documents/month at 96% field-extraction accuracy.",
        "Took a RAG assistant from POC to production over automation execution reports — a LangGraph state machine over FAISS retrieval and Azure OpenAI, served via FastAPI on Azure containers to ~2,000 users across 700+ automation processes.",
        "Engineered automated backend logistics workflows and enterprise integrations: real-time TMS currency rate updates, customs clearance processing, shipment creation, route-deviation alerting, and automated credit-risk and SDLC governance pipelines.",
      ],
      tags: [
        "Qwen 2.5",
        "LoRA / PEFT",
        "Azure Document Intelligence",
        "LangGraph",
        "FAISS",
        "Azure OpenAI",
        "FastAPI",
        "RAG",
      ],
    },
    {
      org: "Infosys",
      short: "Infosys",
      url: "https://www.infosys.com",
      location: "Mysore, India · Amsterdam, NL",
      kind: "employment",
      roles: [{ title: "Technology Analyst", period: "Jan 2019 — May 2023" }],
      bullets: [
        "Delivered automated KYC verification and risk-analysis workflows for the Detecting Financial Crime (DFC) program across 12+ client processes at 99% accuracy, then optimised them to cut execution time ~15% and maintenance effort ~25%.",
        "Built Python utilities for automated post-deployment checks, cutting deployment timelines 20%; founded and led the automation security chapter, mentoring 15+ engineers with zero high-severity incidents.",
      ],
      tags: ["Python", "KYC / AML", "Compliance", "Automation", "SQL"],
    },
  ] as Experience[],

  education: [
    {
      title: "B.E., Computer Science & Engineering",
      org: "Panjab University, SSGRC Hoshiarpur",
      period: "2014 — 2018",
    },
    {
      title: "Senior Secondary (PCM)",
      org: "SSDPS Hoshiarpur",
      period: "2013",
    },
  ] as Credential[],

  leadership: [
    {
      title: "Founder & Lead, Automation Security Chapter",
      org: "Infosys",
      period: "2019 — 2023",
      detail: "Mentored 15+ engineers with zero high-severity incidents.",
    },
  ] as Credential[],

  // --- stage 03: embed ----------------------------------------------------
  projects: [
    {
      name: "nanoGPT from Scratch",
      short: "nanoGPT",
      category: "Document AI & LLMs",
      blurb:
        "Three controlled 124M-parameter pretraining runs at matched compute — 14,190 steps × 524,288 tokens, ~7.44B tokens each on a single A100 80GB — isolating transformer block design from data freshness against a byte-identical validation set. LLaMA-style RMSNorm, RoPE and SwiGLU cut validation loss 3.0931 → 3.0548 with 0.8M fewer parameters; one epoch of fresh tokens reached 3.0462, the best overall. The train–val gap read as a bias–variance signal: 0.06 under three epochs of repeated tokens versus 0.02 on fresh data.",
      tags: ["PyTorch", "RoPE", "SwiGLU", "RMSNorm", "KV cache", "FineWeb-Edu"],
      repo: `${GH}/nanoGPT_Project`,
    },
    {
      name: "ML Researcher — Multi-Agent Research Agent",
      short: "ML researcher",
      category: "Document AI & LLMs",
      blurb:
        "A LangGraph research agent over arXiv, a local notes index, GitHub and YouTube: a router sends the turn to a planner, four source researchers run in parallel, then a reviewer either sends follow-ups back to any source or requests a Python check in Gemini's hosted sandbox before a synthesizer writes the brief. Retrieval is measured on a 100-question golden set across 42,527 chunks — hybrid vector + BM25 with a Cohere rerank from 15 down to 5 reaches 0.82 hit@5 against 0.67 for hybrid alone, a 15-point gain against a ±9-point noise band at that sample size, at 0.58 MRR and 0.60 nDCG@5. Multi-hop is the honest weak spot: both hops land in the top 5 on 0.44 of those questions. Every loop is bounded — three tool calls per researcher, two reviewer rounds — with hashed call dedup so a repeated query is never re-run.",
      tags: [
        "LangGraph",
        "LangChain",
        "Gemini / Vertex AI",
        "Chroma",
        "BM25 hybrid",
        "Cohere rerank",
        "Streamlit",
      ],
      repo: `${GH}/ml-researcher`,
    },
    {
      name: "Calibrated Clinical Risk Scoring",
      short: "Clinical risk",
      category: "Production MLOps",
      blurb:
        "Heart-disease classification pooled across four UCI clinical sites (918 rows, 55% prevalence), with a cost-derived decision threshold of 0.20 pricing a missed diagnosis at 4× a false alarm. 0.891 test ROC-AUC at 0.131 Brier and 0.984 recall — and Leave-One-Site-Out CV reported as the honest generalisation number (~0.70). A tuned XGBoost challenger tied under paired bootstrap but ranked last on LOSO, its edge traced to missingness acting as a site proxy, so the interpretable linear champion stayed in production.",
      tags: ["FastAPI", "Docker", "Cloud Run", "MLflow", "DVC", "Streamlit"],
      repo: `${GH}/heart-disease`,
      demo: "https://heart-disease-ui-92400637925.asia-south1.run.app/",
    },
    {
      name: "Home Credit Default Risk",
      short: "Home Credit",
      category: "Classical ML",
      blurb:
        "Credit-default prediction across seven relational source tables (307,511 borrowers, 8.07% default rate), with 666 domain and aggregation features behind an automated sweep for disguised missing values and sentinel codes. A rank-averaged GBDT ensemble reached 0.79566 private-leaderboard ROC-AUC against 0.79440 for Optuna-tuned XGBoost — and fold-score spread (0.010) ran 5.7× the gap between best and worst model, so pooled out-of-fold AUC predicted the private leaderboard within 0.0001.",
      tags: ["XGBoost", "LightGBM", "CatBoost", "Optuna"],
      repo: `${GH}/HomeCredit`,
    },
    {
      name: "Vision Transformer from Scratch",
      short: "ViT",
      category: "Vision",
      blurb:
        "ViT built from first principles in PyTorch — patch embeddings, multi-head self-attention, and a custom training loop — written to see exactly what the standard abstractions hide.",
      tags: ["PyTorch", "ViT", "Self-Attention"],
      repo: `${GH}/VIT`,
    },
    {
      name: "Qwen LoRA / PEFT",
      short: "Qwen LoRA",
      category: "Document AI & LLMs",
      blurb:
        "Parameter-efficient fine-tuning harness for Qwen models — the open-source counterpart to the adapter work behind the bill-of-lading extractor.",
      tags: ["Qwen", "LoRA / PEFT", "Transformers"],
      repo: `${GH}/QWEN_LORA_PEFT`,
    },
    {
      name: "Brain Tumour Detection",
      short: "Brain tumour",
      category: "Vision",
      blurb:
        "A convolutional classifier over brain-MRI scans, built and trained end to end as a Colab notebook.",
      tags: ["TensorFlow", "CNN", "Medical Imaging"],
      demo: "https://colab.research.google.com/drive/1hEPW5PVkYoTdy6Ptv8wJxNlZmbhbbhtw",
    },
    {
      name: "VAE Anomaly Detection",
      short: "VAE anomaly",
      category: "Vision",
      blurb:
        "A variational autoencoder used as an anomaly detector — reconstruction error as the outlier signal, with the latent space inspected directly.",
      tags: ["PyTorch", "VAE", "Anomaly Detection"],
      repo: `${GH}/vaeAnamolDet`,
    },
    {
      name: "RAG Assistant in Production",
      short: "RAG in production",
      category: "Document AI & LLMs",
      blurb:
        "A retrieval assistant over automation execution reports, taken from POC to production at DSV — a LangGraph state machine over FAISS retrieval and Azure OpenAI, served via FastAPI on Azure containers to ~2,000 users across 700+ automation processes.",
      tags: ["LangGraph", "FAISS", "Azure OpenAI", "FastAPI", "RAG"],
    },
    {
      name: "Distributed Training Practice",
      short: "Distributed training",
      category: "Production MLOps",
      blurb:
        "Distributed training worked through end to end on the Made With ML curriculum — Ray for scale-out, with the surrounding experiment tracking and serving pieces.",
      tags: ["Ray", "DDP", "MLflow"],
      repo: `${GH}/madewithml`,
    },
    {
      name: "Optimisers from Scratch",
      short: "Optimisers",
      category: "Classical ML",
      blurb:
        "SGD, momentum, RMSprop, Adam and AdamW built from the update rule up and checked against torch.optim, with 2-D trajectory plots and MLP loss curves showing how each one actually moves through the landscape.",
      tags: ["PyTorch autograd", "SGD", "Adam", "AdamW", "RMSprop"],
      repo: `${SCRATCH}/tree/master/Optimisers`,
    },
    {
      name: "PCA from Scratch",
      short: "PCA",
      category: "Classical ML",
      blurb:
        "Principal components three ways — eigendecomposition of the covariance matrix, SVD, and kernel PCA — each verified against sklearn.decomposition.PCA.",
      tags: ["NumPy", "SVD", "Kernel PCA", "scikit-learn"],
      repo: `${SCRATCH}/blob/master/pca.ipynb`,
    },
    {
      name: "Linear Regression from Scratch",
      short: "Linear reg",
      category: "Classical ML",
      blurb:
        "Univariate least squares implemented twice — gradient descent against the closed-form normal equations — so the two solutions can be held side by side and shown to agree.",
      tags: ["NumPy", "Gradient Descent", "Normal Equations"],
      repo: `${SCRATCH}/tree/master/Linear%20Regression`,
    },
    {
      name: "Logistic Regression from Scratch",
      short: "Logistic reg",
      category: "Classical ML",
      blurb:
        "Binary classification from first principles, covering linear and polynomial decision boundaries with L2 regularisation.",
      tags: ["NumPy", "Decision Boundaries", "L2"],
      repo: `${SCRATCH}/tree/master/Logistic%20Regression`,
    },
  ] as Project[],

  // --- stage 04: evaluate -------------------------------------------------
  metrics: [
    {
      name: "nanoGPT validation loss",
      value: "3.0548",
      note: "124M parameters at matched compute · LLaMA-style RMSNorm, RoPE and SwiGLU with 0.8M fewer parameters. Best run 3.0462.",
      color: "var(--s1)",
      fill: 0.452,
      scale: "3.10 → 3.00 · lower is better",
    },
    {
      name: "HellaSwag acc_norm",
      value: "0.3056",
      note: "nanoGPT · 56% MFU with custom KV-cache inference. The spread across the three runs sits inside the margin of error.",
      color: "var(--s6)",
      fill: 0.306,
      scale: "0 → 1",
    },
    {
      name: "Clinical risk ROC-AUC",
      value: "0.891",
      note: "Heart-disease classification pooled across four UCI sites · 0.131 Brier, 0.984 recall at a cost-derived threshold of 0.20.",
      color: "var(--s4)",
      fill: 0.891,
      scale: "0 → 1",
    },
    {
      name: "Home Credit ROC-AUC",
      value: "0.79566",
      note: "Private leaderboard · rank-averaged GBDT ensemble over 666 engineered features and 307,511 borrowers.",
      color: "var(--s2)",
      fill: 0.796,
      scale: "0 → 1",
    },
    {
      name: "Clinical risk API latency",
      value: "60–80 ms",
      note: "p95 on FastAPI under GCP Cloud Run · train/serve parity verified across all 230 test rows.",
      color: "var(--s3)",
      fill: 0.533,
      scale: "150 → 0 ms · lower is better",
    },
  ] as Metric[],

  honours: [
    {
      short: "Fairness audit",
      cluster: "Production MLOps",
      text: "Audited algorithmic fairness on the clinical model: quantified a 0.139 per-sex recall gap, logged it to metrics.json, and documented it in the model card.",
      tags: ["MLflow"],
    },
    {
      short: "Posterior mean",
      cluster: "Theory",
      text: "Worked out that MLE, minimising KL divergence, minimising the negative ELBO, score matching, denoising score matching and flow matching are all the same thing — every one of them is hunting for the posterior mean.",
      tags: ["ELBO", "Score Matching", "Flow Matching"],
    },
    {
      short: "Diffusion chain",
      cluster: "Theory",
      text: "Built the diffusion chain from first principles: score matching, the ELBO → score-matching bridge, Fokker–Planck, the reverse SDE, the probability-flow ODE, Tweedie's formula, and the de Bruijn identity that makes KL dissipation equal denoising score matching.",
      tags: ["SDE", "Fokker–Planck", "Tweedie"],
    },
    {
      short: "Fisher map",
      cluster: "Theory",
      text: "Unified three sets of notes — GLM theory, KL/MLE/VI/score matching, and ridge eigenstructure — into one map of Fisher information, objective curvature and the hat matrix, including why the sandwich doesn't collapse (Bartlett vs Huber–White).",
      tags: ["Fisher Information", "GLMs", "Ridge"],
    },
    {
      short: "Leakage rule",
      cluster: "Production MLOps",
      text: "A leakage rule set and kept: visual EDA on the full dataset is fine, but anything that computes a statistic — VIF, IQR, mean, std — waits until after the split.",
      tags: ["scikit-learn"],
    },
  ] as Honour[],

  stack: {
    "machine learning": [
      "scikit-learn",
      "statsmodels",
      "XGBoost",
      "LightGBM",
      "CatBoost",
      "Optuna",
      "SHAP",
      "probability calibration",
    ],
    "deep learning": [
      "PyTorch",
      "TensorFlow",
      "Transformers",
      "ViT",
      "LoRA / PEFT",
      "KV cache",
      "vLLM",
      "DDP",
      "Ray",
    ],
    "llm & genai": [
      "SFT",
      "Hugging Face",
      "RAG",
      "LangChain",
      "LangGraph",
      "FAISS",
      "embeddings",
      "LLM evaluation",
    ],
    "mlops & serving": [
      "MLflow",
      "DVC",
      "Weights & Biases",
      "Docker",
      "FastAPI",
      "GitHub Actions + CML",
      "GCP Cloud Run",
      "PSI drift detection",
      "Streamlit",
    ],
    "data & backend": [
      "Python",
      "SQL",
      "pandas",
      "NumPy",
      "Matplotlib",
      "schema validation",
      "REST APIs",
    ],
    "cloud & platforms": [
      "Azure OpenAI / AI Foundry",
      "Azure Document Intelligence",
      "GCP",
      "Linux",
      "Git",
    ],
  } as Record<string, string[]>,
};

export const fullName = `${profile.firstName} ${profile.lastName}`;
