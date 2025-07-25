import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useAuth from "@/hooks/api/use-auth";
import {
  Users,
  FolderKanban,
  CheckSquare,
  CheckCircle,
  ArrowRight,
  Star,
  Github,
  Sparkles,
  Target,
  Clock,
  MessageSquare,
  UserPlus,
  Settings,
  BarChart3,
  Building2,
  AudioWaveform,
} from "lucide-react";

const LandingPage = () => {
  const { data: authData, error: authError } = useAuth();
  const user = authData?.user;

  // If there's an auth error (like after logout), treat user as logged out
  const isUserAuthenticated = user && !authError;

  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Workspace Collaboration",
      description:
        "Create multiple workspaces and invite team members with role-based permissions. Collaborate seamlessly across different projects.",
    },
    {
      icon: <FolderKanban className="h-8 w-8" />,
      title: "Project Management",
      description:
        "Organize work into projects with custom emojis and descriptions. Track project progress and manage all your initiatives in one place.",
    },
    {
      icon: <CheckSquare className="h-8 w-8" />,
      title: "Advanced Task Management",
      description:
        "Create, assign, and track tasks with priorities (Low, Medium, High), statuses (Backlog, Todo, In Progress, In Review, Done), and due dates.",
    },
    {
      icon: <UserPlus className="h-8 w-8" />,
      title: "Role-Based Access Control",
      description:
        "Manage team permissions with Owner, Admin, and Member roles. Control who can create, edit, or delete projects and tasks.",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Analytics Dashboard",
      description:
        "Track workspace analytics including total tasks, overdue tasks, and completed tasks. Get insights into team productivity.",
    },
    {
      icon: <Settings className="h-8 w-8" />,
      title: "Workspace Settings",
      description:
        "Customize workspace settings, manage member invitations, and configure your team's collaboration environment.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager",
      company: "TechStart",
      content:
        "Team Sync's workspace organization and task management features have streamlined our development process. The role-based permissions are exactly what we needed.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Engineering Lead",
      company: "DevCorp",
      content:
        "The project emoji feature and task status tracking make it easy for our team to stay organized. The analytics dashboard gives us great insights.",
      rating: 5,
    },
    {
      name: "Emily Davis",
      role: "Team Lead",
      company: "StartupXYZ",
      content:
        "Simple yet powerful. Creating workspaces, inviting team members, and managing tasks has never been this straightforward.",
      rating: 5,
    },
  ];

  const plans = [
    {
      name: "Free",
      price: "Free",
      description: "Perfect for all teams - no limits, no restrictions",
      features: [
        "Create unlimited workspaces",
        "Unlimited projects and tasks",
        "Team member invitations",
        "Role-based permissions",
        "Workspace analytics",
        "Advanced task filtering",
        "Custom project emojis",
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <AudioWaveform className="size-4" />
            </div>
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Team Sync
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Testimonials
            </a>
          </div>

          <div className="flex items-center gap-3">
            {isUserAuthenticated ? (
              <Button
                size="sm"
                asChild
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Link to={`/workspace/${user.currentWorkspace?._id}`}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Go to Workspace
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/sign-in">Sign In</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <Link to="/sign-up">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>

        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="flex flex-col items-center text-center space-y-8 max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-muted/50 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              Workspace-based project management
            </div>

            {/* Main heading */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                Organize Teams
                <br />
                <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                  Manage Projects
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Create workspaces, organize projects, and track tasks with our
                intuitive project management platform. Built for teams who value
                organization and clarity.
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {isUserAuthenticated ? (
                <Button
                  size="lg"
                  className="text-lg px-8 py-3 h-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
                  asChild
                >
                  <Link to={`/workspace/${user.currentWorkspace?._id}`}>
                    <Building2 className="mr-2 h-5 w-5" />
                    Go to Your Workspace
                  </Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="text-lg px-8 py-3 h-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
                  asChild
                >
                  <Link to="/sign-up">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
            </div>

            {/* Hero visual */}
            <div className="mt-16 relative">
              <div className="relative rounded-2xl border bg-gradient-to-br from-primary/5 to-secondary/5 p-8 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Workspace Card */}
                  <div className="bg-card rounded-xl p-6 shadow-lg border">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Team Workspace</h3>
                        <p className="text-sm text-muted-foreground">
                          5 members
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>3 Projects Active</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>12 Tasks in Progress</span>
                      </div>
                    </div>
                  </div>

                  {/* Project Card */}
                  <div className="bg-card rounded-xl p-6 shadow-lg border">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <FolderKanban className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">📱 Mobile App</h3>
                        <p className="text-sm text-muted-foreground">Project</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: "70%" }}
                        ></div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        70% Complete
                      </p>
                    </div>
                  </div>

                  {/* Task Card */}
                  <div className="bg-card rounded-xl p-6 shadow-lg border">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckSquare className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">
                          User Authentication
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          TASK-001
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Done
                      </span>
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        High
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-secondary rounded-full opacity-60 animate-pulse delay-700"></div>
                <div className="absolute top-1/2 -right-8 w-4 h-4 bg-primary/60 rounded-full opacity-60 animate-pulse delay-1000"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-background/50 text-sm font-medium">
              <Target className="h-4 w-4 text-primary" />
              Powerful Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Everything You Need
              <br />
              <span className="text-primary">In One Place</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Streamline your workflow with features designed for modern teams
              who value efficiency and collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/50 hover:scale-105 mx-auto w-full max-w-sm"
              >
                <CardHeader className="pb-4 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform mx-auto">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-20 md:py-32 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
        <div className="container relative mx-auto px-4">
          <div className="text-center space-y-6 mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-background/50 text-sm font-medium">
              <MessageSquare className="h-4 w-4 text-primary" />
              Customer Stories
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Loved by Teams
              <br />
              <span className="text-primary">Around the World</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how teams are transforming their productivity with Team Sync.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 hover:shadow-xl transition-all duration-300 mx-auto w-full max-w-sm"
              >
                <CardHeader className="pb-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <CardDescription className="text-base italic leading-relaxed">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 border-t text-center">
                  <div className="space-y-1">
                    <p className="font-semibold text-lg">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-background/50 text-sm font-medium">
              <Clock className="h-4 w-4 text-primary" />
              Free Forever
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Start Building
              <br />
              <span className="text-primary">For Free</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to manage your team's projects and tasks. No
              credit card required, no time limits.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="max-w-md w-full">
              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-primary/5 to-card ring-2 ring-primary">
                <CardHeader className="text-center pb-8 pt-8">
                  <CardTitle className="text-2xl font-bold">
                    {plans[0].name}
                  </CardTitle>
                  <div className="mt-6">
                    <span className="text-5xl font-bold">{plans[0].price}</span>
                  </div>
                  <CardDescription className="text-base mt-4">
                    {plans[0].description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plans[0].features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    size="lg"
                    asChild
                  >
                    {isUserAuthenticated ? (
                      <Link to={`/workspace/${user.currentWorkspace?._id}`}>
                        Go to Workspace
                      </Link>
                    ) : (
                      <Link to="/sign-up">Get Started Now</Link>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10"></div>
        <div className="container relative mx-auto px-4">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Transform
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Your Workflow?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Join thousands of teams who have already made the switch to Team
              Sync. Experience the difference that great project management
              makes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {isUserAuthenticated ? (
                <Button
                  size="lg"
                  className="text-lg px-8 py-3 h-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
                  asChild
                >
                  <Link to={`/workspace/${user.currentWorkspace?._id}`}>
                    <Building2 className="mr-2 h-5 w-5" />
                    Go to Your Workspace
                  </Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="text-lg px-8 py-3 h-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
                  asChild
                >
                  <Link to="/sign-up">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                100% Free forever
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                No time limits
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4 text-center md:text-left">
              <Link
                to="/"
                className="flex items-center gap-2 font-semibold text-lg justify-center md:justify-start"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <AudioWaveform className="size-4" />
                </div>
                Team Sync
              </Link>
              <p className="text-sm text-muted-foreground">
                An open-source project management platform for modern teams.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <a
                  href="#features"
                  className="hover:text-primary transition-colors"
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="hover:text-primary transition-colors"
                >
                  Pricing
                </a>
                <a
                  href="#testimonials"
                  className="hover:text-primary transition-colors"
                >
                  Testimonials
                </a>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-primary"
                asChild
              >
                <a
                  href="https://github.com/thesinghaman/team-sync"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} Team Sync Project. Open source
              and free to use.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
